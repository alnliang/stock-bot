import torch
import torch.nn as nn
import joblib
import numpy as np

from model import StockLSTM
from data_loader import prepare_raw_data, create_sequences

def evaluate_model(
    ticker,
    start_date,
    end_date,
    seq_length=50,
    model_path="lstm_stock_model.pth",
    test_ratio=0.2
):
    """
    1) Load final scalers from disk
    2) Prepare raw data
    3) Identify test portion
    4) Scale, create sequences
    5) Evaluate model
    """
    # Load final scalers
    feature_scaler_path = f"feature_scaler_{ticker}.pkl"
    target_scaler_path  = f"target_scaler_{ticker}.pkl"
    try:
        feature_scaler = joblib.load(feature_scaler_path)
        target_scaler  = joblib.load(target_scaler_path)
    except:
        print("[ERROR] Could not load scaler files. Have you trained the model yet?")
        return None, None

    # Prepare raw data
    df = prepare_raw_data(ticker, start_date, end_date)
    if df.empty:
        return None, None

    feature_cols = [
        "Open", "High", "Low", "Close", "Volume",
        "SMA_5", "SMA_20", "RSI", "EMA_20",
        "MACD", "MACD_Signal", "BB_high", "BB_low"
    ]
    df_features = df[feature_cols].values
    df_target   = df["Close"].values.reshape(-1, 1)

    # Compute test size
    test_size = int(len(df_features) * test_ratio)
    if test_size < seq_length:
        print("[WARNING] Not enough data to create a test split with that ratio. Aborting evaluation.")
        return None, None

    # We'll define the test range as the last `test_size` points
    train_size = len(df_features) - test_size
    test_features = df_features[train_size:]
    test_target   = df_target[train_size:]

    # Scale
    test_features_scaled = feature_scaler.transform(test_features)
    test_target_scaled   = target_scaler.transform(test_target)

    # Create sequences
    X_test, y_test = create_sequences(test_features_scaled, test_target_scaled, seq_length)
    if len(X_test) == 0:
        print("[WARNING] No test sequences created.")
        return None, None

    # Load model
    input_size = len(feature_cols)
    model = StockLSTM(input_size=input_size)
    try:
        model.load_state_dict(torch.load(model_path))
    except:
        print("[ERROR] Could not load model state dict. Check your path or train again.")
        return None, None
    model.eval()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    X_test_t = torch.tensor(X_test, dtype=torch.float32).to(device)
    y_test_t = torch.tensor(y_test, dtype=torch.float32).to(device)

    criterion = nn.MSELoss()
    with torch.no_grad():
        predictions = model(X_test_t)
        test_loss = criterion(predictions, y_test_t).item()

    print(f"Test MSE: {test_loss:.6f}")

    predictions = predictions.cpu().numpy()
    y_test_np   = y_test_t.cpu().numpy()

    # Inverse transform
    predictions = target_scaler.inverse_transform(predictions)
    actuals = target_scaler.inverse_transform(y_test_np)

    return actuals.flatten(), predictions.flatten()

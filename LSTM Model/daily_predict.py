import torch
import numpy as np
from datetime import datetime, timedelta
import joblib

from model import StockLSTM
from data_loader import prepare_raw_data

def predict_next_day_price(
    ticker,
    seq_length=50
):
    """
    1) Load final model & scalers (fitted on historical data).
    2) Fetch ~2 years of recent data for 'ticker'.
    3) Extract last `seq_length` days, scale them, feed to LSTM.
    4) Return predicted next-day closing price (in original scale).
    """
    model_path = f"lstm_{ticker}_model.pth"
    feature_scaler_path = f"feature_scaler_{ticker}.pkl"
    target_scaler_path = f"target_scaler_{ticker}.pkl"

    # Load model
    input_size = 13  # match the number of features you used
    model = StockLSTM(input_size=input_size)
    try:
        model.load_state_dict(torch.load(model_path))
    except:
        print(f"[ERROR] Could not load model from {model_path}. You must train first.")
        return None
    model.eval()

    # Load scalers
    try:
        feature_scaler = joblib.load(feature_scaler_path)
        target_scaler  = joblib.load(target_scaler_path)
    except:
        print("[ERROR] Could not load scalers. Have you trained the model yet?")
        return None

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    # Fetch recent data (last ~2 yrs)
    end_date = datetime.today().strftime("%Y-%m-%d")
    start_date = (datetime.today() - timedelta(days=730)).strftime("%Y-%m-%d")
    
    df = prepare_raw_data(ticker, start_date, end_date)
    if df.empty or len(df) < seq_length:
        print(f"Not enough data for {ticker} to predict next day.")
        return None

    # Prepare features
    feature_cols = [
        "Open", "High", "Low", "Close", "Volume",
        "SMA_5", "SMA_20", "RSI", "EMA_20",
        "MACD", "MACD_Signal", "BB_high", "BB_low"
    ]
    recent_features = df[feature_cols].values

    # Grab the last seq_length
    last_seq = recent_features[-seq_length:]
    # Scale
    last_seq_scaled = feature_scaler.transform(last_seq)

    # Convert to tensor
    X_input = np.expand_dims(last_seq_scaled, axis=0)
    X_input = torch.tensor(X_input, dtype=torch.float32).to(device)

    with torch.no_grad():
        pred_scaled = model(X_input).cpu().numpy()  # shape = (1,1)

    # Inverse transform
    predicted_price = target_scaler.inverse_transform(pred_scaled)[0, 0]

    return float(predicted_price)

if __name__ == "__main__":
    # Example usage:
    ticker = "JPM"
    prediction = predict_next_day_price(ticker)
    if prediction is not None:
        print(f"Predicted next-day close for {ticker}: {prediction}")
    else:
        print("Prediction not available.")

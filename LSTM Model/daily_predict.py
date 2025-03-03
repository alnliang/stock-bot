import torch
import numpy as np
from datetime import datetime, timedelta
import joblib

from model import StockLSTM
from data_loader import fetch_stock_data, add_technical_indicators

def predict_next_day_price(
    ticker,
    seq_length=50
):
    """
    Pulls ~1 year of recent data for 'ticker', extracts the last `seq_length` days,
    and predicts tomorrow's closing price using the saved LSTM model for that ticker.

    Returns:
      predicted_price (float) - Predicted next-day closing price in original scale,
                               or None if not enough data.
    """

    # 1) Build the file paths for the per-ticker model & scalers
    model_path = f"lstm_{ticker}_model.pth"
    feature_scaler_path = f"feature_scaler_{ticker}.pkl"
    target_scaler_path = f"target_scaler_{ticker}.pkl"

    # 2) Load the model
    #    Note: The input_size must match how many features your model expects
    model = StockLSTM(input_size=13)  # Adjust if you have 13 features, for example
    model.load_state_dict(torch.load(model_path))
    model.eval()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    # 3) Fetch recent data (last 365 days)
    end_date = datetime.today().strftime("%Y-%m-%d")
    start_date = (datetime.today() - timedelta(days=365)).strftime("%Y-%m-%d")
    df = fetch_stock_data(ticker, start_date, end_date)

    if df.empty or len(df) < seq_length:
        print(f"Not enough data for {ticker} to predict.")
        return None

    df = add_technical_indicators(df)

    # 4) Prepare the last `seq_length` rows as features
    #    This list of columns must match what you used during training
    feature_cols = [
        "Open", "High", "Low", "Close", "Volume",
        "SMA_5", "SMA_20", "RSI", "EMA_20",
        "MACD", "MACD_Signal", "BB_high", "BB_low"
    ]

    # Ensure these columns exist in df. If any are missing, your code may need checks/handling.
    recent_features = df[feature_cols].values[-seq_length:]

    # 5) Load the saved scalers
    feature_scaler = joblib.load(feature_scaler_path)
    target_scaler = joblib.load(target_scaler_path)

    # 6) Scale recent features
    scaled_recent = feature_scaler.transform(recent_features)

    # 7) Reshape for LSTM
    X_input = np.expand_dims(scaled_recent, axis=0)
    X_input = torch.tensor(X_input, dtype=torch.float32).to(device)

    # 8) Predict
    with torch.no_grad():
        pred_scaled = model(X_input).cpu().numpy()  # shape = (1,1)

    # 9) Inverse transform to original scale
    predicted_price = target_scaler.inverse_transform(pred_scaled)[0, 0]
    return float(predicted_price)

if __name__ == "__main__":
    # Example usage: 
    ticker = "AAPL"
    prediction = predict_next_day_price(ticker)
    if prediction is not None:
        print(f"Predicted next-day close for {ticker}: {prediction}")
    else:
        print("Prediction not available.")

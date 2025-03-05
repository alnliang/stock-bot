# daily_predict.py

import torch
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from model import StockLSTM
from data_loader import fetch_stock_data, add_technical_indicators
from sklearn.preprocessing import MinMaxScaler

def predict_next_day_price(
    ticker,
    model_path="lstm_stock_model.pth",
    seq_length=50
):
    """
    Pulls recent historical data (up to today) for 'ticker',
    extracts the last `seq_length` days, and predicts tomorrow's closing price
    using the saved LSTM model.
    
    Returns:
      predicted_price (float) - in original scale
    """
    
    # 1) LOAD MODEL (must match same hyperparams used in training, especially input_size)
    # For multi-feature input, input_size=8 (Open,High,Low,Close,Volume,SMA_5,SMA_20,RSI)
    model = StockLSTM(input_size=8)
    model.load_state_dict(torch.load(model_path))
    model.eval()
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    
    # 2) FETCH RECENT DATA (let's fetch 1 year back)
    end_date = datetime.today().strftime("%Y-%m-%d")
    start_date = (datetime.today() - timedelta(days=365)).strftime("%Y-%m-%d")
    df = fetch_stock_data(ticker, start_date, end_date)
    if df.empty or len(df) < seq_length:
        print(f"Not enough data for {ticker} to predict.")
        return None
    
    # 3) ADD TECHNICAL INDICATORS
    df = add_technical_indicators(df)
    
    # 4) PREPARE THE LAST seq_length ROWS AS FEATURES
    #    For multi-feature: [Open, High, Low, Close, Volume, SMA_5, SMA_20, RSI]
    feature_cols = ["Open", "High", "Low", "Close", "Volume", "SMA_5", "SMA_20", "RSI"]
    df_features = df[feature_cols].values
    
    # We only want the last seq_length rows
    recent_features = df_features[-seq_length:]
    
    # SCALE the recent_features (in production, use the same scaler from training!)
    # Here, for demonstration, we'll just fit a new scaler on the last seq_length rows.
    # For best results, load the original scaler saved from training.
    scaler = MinMaxScaler()
    scaled_recent = scaler.fit_transform(recent_features)
    
    # RESHAPE for LSTM: (1, seq_length, input_size)
    X_input = np.expand_dims(scaled_recent, axis=0)
    X_input = torch.tensor(X_input, dtype=torch.float32).to(device)
    
    # 5) PREDICT
    with torch.no_grad():
        pred_scaled = model(X_input).cpu().numpy()  # shape = (1,1)
    
    # Because we used a brand-new scaler fit on the last seq_length rows, we can invert it,
    # but it's not the same as the original training scaler. This is a hacky approach. 
    # Ideally, load the training scaler to get consistent transformations.
    # We'll just invert based on this local scaler:
    # We assume the 'Close' is in roughly the same scale as the other features. 
    # This can introduce error but is included here for demonstration.
    dummy_target = np.zeros((seq_length, scaled_recent.shape[1]))
    dummy_target[:, -1] = pred_scaled[0, 0]  # put the predicted scale in the last column
    unscaled_dummy = scaler.inverse_transform(dummy_target)
    predicted_price = unscaled_dummy[-1, -1]
    
    return float(predicted_price)

if __name__ == "__main__":
    # Example usage
    ticker = "AAPL"
    predicted = predict_next_day_price(ticker)
    print(f"Predicted next-day close for {ticker}: {predicted}")

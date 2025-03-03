import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import torch

def fetch_stock_data(ticker, start_date, end_date):
    """
    Fetches historical data from Yahoo Finance.
    """
    df = yf.download(ticker, start=start_date, end=end_date)
    df.dropna(inplace=True)
    return df

def calculate_rsi(data, window=14):
    delta = data.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / (loss + 1e-10)
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_macd(data, fast_period=12, slow_period=26, signal_period=9):
    exp1 = data.ewm(span=fast_period, adjust=False).mean()
    exp2 = data.ewm(span=slow_period, adjust=False).mean()
    macd = exp1 - exp2
    macd_signal = macd.ewm(span=signal_period, adjust=False).mean()
    return macd, macd_signal

def calculate_bollinger_bands(data, window=20, num_of_std=2):
    rolling_mean = data.rolling(window=window).mean()
    rolling_std = data.rolling(window=window).std()
    upper_band = rolling_mean + (rolling_std * num_of_std)
    lower_band = rolling_mean - (rolling_std * num_of_std)
    return upper_band, lower_band

def add_technical_indicators(df):
    df["SMA_5"] = df["Close"].rolling(window=5).mean()
    df["SMA_20"] = df["Close"].rolling(window=20).mean()
    df["RSI"] = calculate_rsi(df["Close"])
    df['MACD'], df['MACD_Signal'] = calculate_macd(df['Close'])
    df['BB_high'], df['BB_low'] = calculate_bollinger_bands(df['Close'])
    df['EMA_20'] = df['Close'].ewm(span=20, adjust=False).mean()

    df.ffill(inplace=True)
    df.bfill(inplace=True)
    return df

def create_sequences(features, targets, seq_length=50):
    X, y = [], []
    for i in range(len(features) - seq_length):
        X.append(features[i : i + seq_length])
        y.append(targets[i + seq_length])
    return np.array(X), np.array(y).reshape(-1, 1)

def prepare_data(ticker, start_date, end_date, seq_length=50):
    """
    Returns:
      X (torch.FloatTensor): The entire dataset's features (for cross-validation or final split)
      y (torch.FloatTensor): The entire dataset's targets
      feature_scaler, target_scaler
    """
    df = fetch_stock_data(ticker, start_date, end_date)
    df = add_technical_indicators(df)

    # SELECT FEATURES
    feature_cols = [
        "Open", "High", "Low", "Close", "Volume",
        "SMA_5", "SMA_20", "RSI", "EMA_20",
        "MACD", "MACD_Signal", "BB_high", "BB_low"
    ]
    df_features = df[feature_cols].copy()
    df_target = df["Close"].copy()

    # SCALE
    feature_scaler = MinMaxScaler()
    target_scaler = MinMaxScaler()

    features = feature_scaler.fit_transform(df_features.values)
    targets = target_scaler.fit_transform(df_target.values.reshape(-1, 1))

    # CREATE SEQUENCES
    X_all, y_all = create_sequences(features, targets, seq_length)

    # Convert to torch tensors
    X_all = torch.tensor(X_all, dtype=torch.float32)
    y_all = torch.tensor(y_all, dtype=torch.float32)

    return X_all, y_all, feature_scaler, target_scaler

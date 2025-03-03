# data_loader.py

import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

def fetch_stock_data(ticker, start_date, end_date):
    """
    Fetches historical data from Yahoo Finance.
    """
    df = yf.download(ticker, start=start_date, end=end_date)
    df.dropna(inplace=True)
    return df

def add_technical_indicators(df):
    """
    Adds simple technical indicators:
      - SMA_5 (5-day simple moving average)
      - SMA_20 (20-day simple moving average)
      - RSI (14-day Relative Strength Index)
    Feel free to add more (e.g., MACD, Bollinger Bands).
    """
    # SMA_5
    df["SMA_5"] = df["Close"].rolling(window=5).mean()
    # SMA_20
    df["SMA_20"] = df["Close"].rolling(window=20).mean()
    
    # RSI (14-day) - simplified version
    # RSI = 100 - (100 / (1 + RS)) where RS = avg_gain / avg_loss over 'n' periods
    window_length = 14
    delta = df["Close"].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window_length).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window_length).mean()
    rs = gain / (loss + 1e-9)  # avoid division by zero
    df["RSI"] = 100 - (100 / (1 + rs))
    
    df.fillna(method="bfill", inplace=True)  # backfill to handle NaN from rolling
    df.fillna(method="ffill", inplace=True)
    return df

def create_sequences(features, targets, seq_length=50):
    """
    Creates overlapping sequences of length 'seq_length'
    from 'features' (shape: [n_samples, n_features])
    and the corresponding 'targets' (shape: [n_samples,]).
    
    Returns arrays X, y of shape:
      X -> [num_sequences, seq_length, n_features]
      y -> [num_sequences, 1]
    """
    X, y = [], []
    for i in range(len(features) - seq_length):
        X.append(features[i : i + seq_length])
        y.append(targets[i + seq_length])
    return np.array(X), np.array(y).reshape(-1, 1)

def prepare_data(ticker, start_date, end_date, seq_length=50):
    """
    1) Fetch data from Yahoo Finance
    2) Add technical indicators
    3) Choose relevant columns for features
    4) Scale data
    5) Create sequences
    6) Split into train/val/test
    7) Return X_train, y_train, X_val, y_val, X_test, y_test, scaler
    """
    df = fetch_stock_data(ticker, start_date, end_date)
    df = add_technical_indicators(df)
    
    # SELECT COLUMNS: Open, High, Low, Close, Volume, SMA_5, SMA_20, RSI
    # (Feel free to add more or remove some)
    feature_cols = ["Open", "High", "Low", "Close", "Volume", "SMA_5", "SMA_20", "RSI"]
    df_features = df[feature_cols].copy()
    # TARGET = next-day Close
    df_target = df["Close"].copy()
    
    # Convert to NumPy
    features = df_features.values
    targets = df_target.values
    
    # SCALE features and targets together or separately
    # Here we scale features only. We'll scale target by the same scaler or a second scaler.
    scaler = MinMaxScaler()
    scaled_features = scaler.fit_transform(features)
    
    # We'll do a separate scaler for the target if you like, or just reuse the same range
    # For simplicity, let's scale target using the same approach but it's less accurate
    # to do it this way. The better approach is to have a separate scaler for the target.
    # We'll do it in a single scaler for demonstration:
    target_scaler = MinMaxScaler()
    scaled_targets = target_scaler.fit_transform(targets.reshape(-1, 1))
    
    # CREATE sequences
    X_all, y_all = create_sequences(scaled_features, scaled_targets, seq_length=seq_length)
    
    # TRAIN/VAL/TEST SPLIT (e.g., 70/15/15)
    train_size = int(0.7 * len(X_all))
    val_size = int(0.15 * len(X_all))
    
    X_train = X_all[:train_size]
    y_train = y_all[:train_size]
    
    X_val = X_all[train_size : train_size + val_size]
    y_val = y_all[train_size : train_size + val_size]
    
    X_test = X_all[train_size + val_size :]
    y_test = y_all[train_size + val_size :]
    
    # Convert to float32 if needed by PyTorch
    import torch
    X_train = torch.tensor(X_train, dtype=torch.float32)
    y_train = torch.tensor(y_train, dtype=torch.float32)
    X_val   = torch.tensor(X_val, dtype=torch.float32)
    y_val   = torch.tensor(y_val, dtype=torch.float32)
    X_test  = torch.tensor(X_test, dtype=torch.float32)
    y_test  = torch.tensor(y_test, dtype=torch.float32)
    
    return X_train, y_train, X_val, y_val, X_test, y_test, scaler, target_scaler

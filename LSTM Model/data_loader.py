import yfinance as yf
import numpy as np
import torch
from sklearn.preprocessing import MinMaxScaler

def fetch_stock_data(ticker, start_date, end_date):
    """Fetch historical stock data from Yahoo Finance."""
    data = yf.download(ticker, start=start_date, end=end_date)
    return data

def create_sequences(data, seq_length=50):
    """Convert stock prices into sequences for LSTM."""
    sequences, targets = [], []
    for i in range(len(data) - seq_length):
        sequences.append(data[i:i+seq_length])
        targets.append(data[i+seq_length])
    return np.array(sequences), np.array(targets)

def prepare_data(data, seq_length=50, train_split=0.8):
    """Prepares data for training/testing."""
    prices = data["Close"].values.reshape(-1, 1)
    
    #NORMALIZE DATA
    scaler = MinMaxScaler(feature_range=(0, 1))
    prices_scaled = scaler.fit_transform(prices)
    
    #CREATE SEQUENCES
    X, y = create_sequences(prices_scaled, seq_length)
    
    #SPLIT DATA
    train_size = int(len(X) * train_split)
    X_train, y_train = X[:train_size], y[:train_size]
    X_test, y_test = X[train_size:], y[train_size:]

    #CONVERT PYTORCH TO TENSORS
    return (
        torch.tensor(X_train, dtype=torch.float32),
        torch.tensor(y_train, dtype=torch.float32),
        torch.tensor(X_test, dtype=torch.float32),
        torch.tensor(y_test, dtype=torch.float32),
        scaler,  # Return scaler for inverse transform later
    )

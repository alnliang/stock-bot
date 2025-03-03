import yfinance as yf
import numpy as np
import pandas as pd

def fetch_stock_data(ticker, start_date, end_date):
    """
    Fetches historical data from Yahoo Finance and does a quick sanity check.
    """
    df = yf.download(ticker, start=start_date, end=end_date)
    df.dropna(inplace=True)

    # Basic check for data length and date continuity
    if df.empty:
        print(f"[WARNING] fetch_stock_data: No data returned for {ticker} from {start_date} to {end_date}.")
        return df

    # Warn if the last row date is more than a few days older than 'end_date'
    actual_end = df.index[-1]
    if (pd.Timestamp(end_date) - actual_end).days > 7:
        print(f"[WARNING] fetch_stock_data: Last date in data is {actual_end.date()}, which is more than 7 days before {end_date}.")

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
    df["MACD"], df["MACD_Signal"] = calculate_macd(df["Close"])
    df["BB_high"], df["BB_low"] = calculate_bollinger_bands(df["Close"])
    df["EMA_20"] = df["Close"].ewm(span=20, adjust=False).mean()

    # Fill any remaining NaNs
    df.ffill(inplace=True)
    df.bfill(inplace=True)
    return df

def create_sequences(features, targets, seq_length=50):
    """
    Standard sequence creation for an LSTM:
      - features: shape (N, num_features)
      - targets:  shape (N,) or (N,1)
    Returns:
      X, y as arrays, where each X[i] has shape (seq_length, num_features)
    """
    X, y = [], []
    for i in range(len(features) - seq_length):
        X.append(features[i : i + seq_length])
        y.append(targets[i + seq_length])
    return np.array(X), np.array(y).reshape(-1, 1)

def prepare_raw_data(ticker, start_date, end_date):
    """
    Fetches data and adds technical indicators, but does NOT scale or create sequences.
    Returns:
        df (pd.DataFrame) with columns needed for feature construction.
    """
    df = fetch_stock_data(ticker, start_date, end_date)
    if df.empty:
        return df  # empty or warning handled upstream

    df = add_technical_indicators(df)
    return df

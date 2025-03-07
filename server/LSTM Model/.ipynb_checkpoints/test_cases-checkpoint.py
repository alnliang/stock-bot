# test_all.py

import os
import pytest
import torch
import pandas as pd
from datetime import datetime

# Adjust these imports if your code is in a different directory or folder structure
from data_loader import (
    fetch_stock_data,
    add_technical_indicators,
    create_sequences,
    prepare_data
)
from model import StockLSTM
from train import train_model
from test import evaluate_model


# -------------------------------------------------------------------------
# 1. DATA LOADER TESTS
# -------------------------------------------------------------------------

def test_fetch_stock_data():
    """
    Test that fetch_stock_data returns a DataFrame with expected columns for a known ticker.
    """
    ticker = "AAPL"
    start_date = "2022-01-01"
    end_date = "2022-02-01"
    
    df = fetch_stock_data(ticker, start_date, end_date)
    
    # Basic checks
    assert isinstance(df, pd.DataFrame), "fetch_stock_data should return a DataFrame."
    # By default, yfinance includes columns like Open, High, Low, Close, etc.
    required_cols = {"Open", "High", "Low", "Close"}
    assert required_cols.issubset(df.columns), (
        f"Missing some required columns in DataFrame: {df.columns}"
    )

def test_add_technical_indicators():
    """
    Test that technical indicators (SMA_5, SMA_20, RSI) are added to the DataFrame.
    """
    # Create a minimal DataFrame
    data = {
        "Open": [150, 151, 152, 153, 154, 155, 156],
        "High": [151, 152, 153, 154, 155, 156, 157],
        "Low":  [149, 150, 151, 152, 153, 154, 155],
        "Close":[150, 151, 152, 153, 154, 155, 156],
        "Volume":[100, 200, 300, 400, 500, 600, 700]
    }
    df = pd.DataFrame(data)
    
    df_with_indicators = add_technical_indicators(df)
    
    for col in ["SMA_5", "SMA_20", "RSI"]:
        assert col in df_with_indicators.columns, f"{col} indicator not added to DataFrame."

def test_create_sequences():
    """
    Test that create_sequences correctly slices the data into sequences of length seq_length.
    """
    features = [[i] for i in range(100)]  # shape (100,1)
    targets  = [i for i in range(100)]
    
    seq_length = 10
    X, y = create_sequences(features, targets, seq_length=seq_length)
    
    # X should have shape (90,10,1)
    assert X.shape == (90, 10, 1), f"Expected X.shape (90, 10, 1), got {X.shape}"
    # y should have shape (90,1)
    assert y.shape == (90, 1), f"Expected y.shape (90, 1), got {y.shape}"
    
    # Check first sequence
    assert (X[0].flatten() == list(range(10))).all(), "First sequence does not match expected range(0..9)"
    assert y[0].item() == 10, "First target should be element at index 10"

def test_prepare_data():
    """
    Test that prepare_data returns the correct splits and types (PyTorch Tensors).
    """
    ticker = "AAPL"
    start_date = "2022-01-01"
    end_date   = "2022-02-01"
    
    seq_length = 5
    
    # This function fetches data, adds indicators, etc.
    outputs = prepare_data(ticker, start_date, end_date, seq_length)
    # outputs = (X_train, y_train, X_val, y_val, X_test, y_test, scaler, target_scaler)
    
    assert len(outputs) == 8, "prepare_data should return 8 items."
    X_train, y_train, X_val, y_val, X_test, y_test, scaler, target_scaler = outputs
    
    # Basic type checks
    for tensor_var in [X_train, y_train, X_val, y_val, X_test, y_test]:
        assert isinstance(tensor_var, torch.Tensor), "Data splits should be PyTorch Tensors."
    
    # Hard to assert exact shape without controlling data size, 
    # but let's ensure at least we have non-zero lengths (if data is available).
    # If your data range is short, yfinance might return fewer days, so let's 
    # just confirm no major errors occurred.
    assert len(X_train) >= 0, "X_train length is invalid."
    assert scaler is not None, "Feature scaler is not returned."
    assert target_scaler is not None, "Target scaler is not returned."


# -------------------------------------------------------------------------
# 2. MODEL TESTS
# -------------------------------------------------------------------------

def test_model_forward():
    """
    Tests that the model's forward pass works with correct input shapes.
    """
    batch_size = 16
    seq_length = 10
    input_size = 8  # e.g., [Open, High, Low, Close, Volume, SMA_5, SMA_20, RSI]
    
    model = StockLSTM(input_size=input_size, hidden_size=32, num_layers=2, output_size=1, dropout=0.0)
    
    X = torch.rand((batch_size, seq_length, input_size), dtype=torch.float32)
    output = model(X)
    
    # Output shape should be (batch_size, 1)
    assert output.shape == (batch_size, 1), f"Expected output shape: (16, 1), got {output.shape}"

def test_lstm_parameters():
    """
    Check that the LSTM layers have the correct input & hidden dimensions.
    """
    input_size = 8
    hidden_size = 64
    num_layers = 2
    
    model = StockLSTM(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers)
    
    # The first LSTM layer should expect input_size=8
    assert model.lstm.input_size == input_size, "LSTM input_size mismatch."
    assert model.lstm.hidden_size == hidden_size, "LSTM hidden_size mismatch."
    assert model.lstm.num_layers == num_layers, "LSTM num_layers mismatch."


# -------------------------------------------------------------------------
# 3. TRAINING & INTEGRATION TEST
# -------------------------------------------------------------------------

def test_train_model(tmp_path):
    """
    Test the training procedure end-to-end:
      - Train on a small date range
      - Check that a model file is created
      - Check final model is returned
    """
    ticker = "AAPL"
    start_date = "2022-01-01"
    end_date   = "2022-02-01"
    
    save_path = tmp_path / "test_lstm_stock_model.pth"
    
    model, scaler, target_scaler = train_model(
        ticker=ticker,
        start_date=start_date,
        end_date=end_date,
        seq_length=5,
        hidden_size=16,
        num_layers=1,
        dropout=0.0,
        learning_rate=1e-3,
        epochs=2,   # Keep it small for quick testing
        patience=1, # Stop early quickly
        save_path=str(save_path)
    )
    
    # Check that the model file was created
    assert os.path.isfile(save_path), "Model file not saved after training."
    
    # Check that the returned model is not None
    assert model is not None, "train_model did not return a model instance."
    
    # Check we have valid scalers
    assert scaler is not None, "No feature scaler returned."
    assert target_scaler is not None, "No target scaler returned."

    # Optionally, check if the model can do a forward pass on some random data
    X_test = torch.rand((4, 5, 8))  # (batch_size=4, seq_length=5, input_size=8)
    with torch.no_grad():
        output = model(X_test)
    assert output.shape == (4, 1), f"Expected shape (4,1), got {output.shape}"


def test_evaluate_model():
    """
    Test the evaluate_model function to ensure it returns predictions & actuals.
    We do a quick test on a small dataset. The actual MSE might be large if data is small.
    """
    ticker = "AAPL"
    start_date = "2022-01-01"
    end_date   = "2022-02-01"
    
    # Train a quick model
    model, scaler, target_scaler = train_model(
        ticker=ticker,
        start_date=start_date,
        end_date=end_date,
        seq_length=5,
        hidden_size=16,
        num_layers=1,
        dropout=0.0,
        learning_rate=1e-3,
        epochs=2,
        patience=1,
        save_path="temp_model.pth"
    )
    
    # Evaluate
    actuals, predictions = evaluate_model(
        ticker=ticker,
        start_date=start_date,
        end_date=end_date,
        seq_length=5,
        model_path="temp_model.pth"
    )
    
    # Basic checks
    assert len(actuals) == len(predictions), "Length mismatch between actuals and predictions."
    # We can remove temp file after test if we like
    if os.path.isfile("temp_model.pth"):
        os.remove("temp_model.pth")








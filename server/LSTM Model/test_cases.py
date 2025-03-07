import os
import pytest
import torch
import pandas as pd
from data_loader import (
    fetch_stock_data,
    add_technical_indicators,
    create_sequences
)
from model import StockLSTM


# -------------------------------------------------------------------------
# 1. DATA LOADER TESTS
# -------------------------------------------------------------------------

def test_fetch_stock_data():
    """
    Tests if fetch_stock_data returns a DataFrame with required stock columns.
    """
    ticker = "AAPL"
    start_date = "2022-01-01"
    end_date = "2022-02-01"

    df = fetch_stock_data(ticker, start_date, end_date)

    assert isinstance(df, pd.DataFrame), "fetch_stock_data should return a DataFrame."
    required_cols = {"Open", "High", "Low", "Close"}
    
    if isinstance(df.columns, pd.MultiIndex):
        columns_level = df.columns.get_level_values(0)
    else:
        columns_level = df.columns

    assert required_cols.issubset(columns_level), (
        f"Missing required columns: {required_cols - set(columns_level)}"
    )


def test_add_technical_indicators():
    """
    Ensures add_technical_indicators adds SMA_5, SMA_20, and RSI to the DataFrame.
    """
    data = {
        "Close": [150, 151, 152, 153, 154, 155, 156],
        "Open": [148, 149, 150, 151, 152, 153, 154],
        "High": [151, 152, 153, 154, 155, 156, 157],
        "Low": [147, 148, 149, 150, 151, 152, 153],
        "Volume": [100, 200, 300, 400, 500, 600, 700]
    }
    df = pd.DataFrame(data)
    df_with_indicators = add_technical_indicators(df)

    for col in ["SMA_5", "SMA_20", "RSI"]:
        assert col in df_with_indicators.columns, f"{col} indicator not added."


def test_add_technical_indicators_no_crash():
    """
    Ensures add_technical_indicators does not crash with minimal data.
    """
    df = pd.DataFrame({"Close": [150, 151, 152, 153, 154]})
    df_with_indicators = add_technical_indicators(df)

    assert isinstance(df_with_indicators, pd.DataFrame), "Function should return a DataFrame."
    assert len(df_with_indicators) == len(df), "Output DataFrame should have the same number of rows."


def test_create_sequences():
    """
    Ensures create_sequences correctly generates data sequences of the specified length.
    """
    features = [[i] for i in range(100)]
    targets = [i for i in range(100)]
    seq_length = 10

    X, y = create_sequences(features, targets, seq_length)

    assert X.shape == (90, 10, 1), f"Expected X.shape (90, 10, 1), got {X.shape}"
    assert y.shape == (90, 1), f"Expected y.shape (90, 1), got {y.shape}"

    assert (X[0].flatten() == list(range(10))).all(), "First sequence incorrect."
    assert y[0].item() == 10, "First target should be element at index 10."


# -------------------------------------------------------------------------
# 2. MODEL TESTS
# -------------------------------------------------------------------------

def test_model_forward():
    """
    Ensures StockLSTM's forward pass produces the correct output shape.
    """
    batch_size = 16
    seq_length = 10
    input_size = 8  # Number of features

    model = StockLSTM(input_size=input_size, hidden_size=32, num_layers=2, output_size=1, dropout=0.0)

    X = torch.rand((batch_size, seq_length, input_size), dtype=torch.float32)
    output = model(X)

    assert output.shape == (batch_size, 1), f"Expected output shape: (16, 1), got {output.shape}"


def test_lstm_parameters():
    """
    Ensures LSTM layers in StockLSTM are initialized with correct dimensions.
    """
    input_size = 8
    hidden_size = 64
    num_layers = 2

    model = StockLSTM(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers)

    assert model.lstm.input_size == input_size, "LSTM input size mismatch."
    assert model.lstm.hidden_size == hidden_size, "LSTM hidden size mismatch."
    assert model.lstm.num_layers == num_layers, "LSTM num layers mismatch."


def test_model_dropout():
    """
    Ensures the dropout layer in StockLSTM is set correctly.
    """
    input_size = 8
    hidden_size = 32
    num_layers = 2
    dropout = 0.3

    model = StockLSTM(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers, dropout=dropout)

    assert model.dropout.p == dropout, f"Expected dropout {dropout}, got {model.dropout.p}."


def test_model_weight_initialization():
    """
    Ensures the LSTM model weights are properly initialized and not all zeros.
    """
    input_size = 8
    hidden_size = 32
    num_layers = 2

    model = StockLSTM(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers)

    # Fetching the first LSTM layer's weights
    lstm_weight = model.lstm.weight_hh_l0.data

    assert lstm_weight is not None, "LSTM weights should be initialized."
    assert not torch.all(lstm_weight == 0), "LSTM weights should not be all zeros."

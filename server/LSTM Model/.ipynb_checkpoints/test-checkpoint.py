# test.py

import torch
import torch.nn as nn
from model import StockLSTM
from data_loader import prepare_data
import numpy as np

def evaluate_model(
    ticker,
    start_date,
    end_date,
    seq_length=50,
    model_path="lstm_stock_model.pth"
):
    """
    Loads the saved model, prepares test data from 'start_date' to 'end_date',
    and computes MSE on the test set. Also returns predictions vs actual for plotting.
    """
    
    # PREPARE DATA
    X_train, y_train, X_val, y_val, X_test, y_test, scaler, target_scaler = prepare_data(
        ticker, start_date, end_date, seq_length
    )
    
    # LOAD MODEL
    input_size = X_train.shape[2]
    model = StockLSTM(input_size=input_size)
    model.load_state_dict(torch.load(model_path))
    model.eval()
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    
    X_test, y_test = X_test.to(device), y_test.to(device)
    
    # EVALUATE
    criterion = nn.MSELoss()
    with torch.no_grad():
        predictions = model(X_test)
        test_loss = criterion(predictions, y_test).item()
    
    print(f"Test MSE: {test_loss:.6f}")
    
    # CONVERT TO NUMPY
    predictions = predictions.cpu().numpy()
    y_test = y_test.cpu().numpy()
    
    # INVERSE TRANSFORM
    # Because we used target_scaler, let's invert them
    predictions = target_scaler.inverse_transform(predictions)
    actuals = target_scaler.inverse_transform(y_test)
    
    return actuals.flatten(), predictions.flatten()

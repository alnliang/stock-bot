import torch
import torch.nn as nn
from model import StockLSTM
from data_loader import prepare_data
import numpy as np
import joblib

def evaluate_model(
    ticker,
    start_date,
    end_date,
    seq_length=50,
    model_path="lstm_stock_model.pth",
    test_ratio=0.2
):
    """
    Loads the saved model, prepares the entire dataset (X, y),
    uses the last `test_ratio` fraction of data as test set,
    computes MSE on the test portion, and returns predictions vs actual.
    """
    X, y, feature_scaler, target_scaler = prepare_data(ticker, start_date, end_date, seq_length)

    test_size = int(len(X) * test_ratio)
    if test_size == 0:
        print("Not enough data to create a test split.")
        return None, None

    # Split off the last test_size samples for final evaluation
    X_test = X[-test_size:]
    y_test = y[-test_size:]

    # Load the trained model
    input_size = X.shape[2]
    model = StockLSTM(input_size=input_size)
    model.load_state_dict(torch.load(model_path))
    model.eval()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    X_test, y_test = X_test.to(device), y_test.to(device)

    criterion = nn.MSELoss()
    with torch.no_grad():
        predictions = model(X_test)
        test_loss = criterion(predictions, y_test).item()

    print(f"Test MSE: {test_loss:.6f}")

    # Convert to NumPy for inverse transform
    predictions = predictions.cpu().numpy()
    y_test = y_test.cpu().numpy()

    # Inverse transform
    predictions = target_scaler.inverse_transform(predictions)
    actuals = target_scaler.inverse_transform(y_test)

    return actuals.flatten(), predictions.flatten()

import torch
import numpy as np
import pandas as pd
from model import StockLSTM
from data_loader import fetch_stock_data, prepare_data

def evaluate_model(ticker, start_date, end_date, seq_length=50):
    #LOAD THE DATA
    data = fetch_stock_data(ticker, start_date, end_date)
    _, _, X_test, y_test, scaler = prepare_data(data, seq_length)
    
    #LOAD THE TRAINED MODEL
    model = StockLSTM()
    model.load_state_dict(torch.load("lstm_stock_model.pth"))
    model.eval()

    # #MOVE TO GPU IF AVAILABLE (only for nvidia GPUs)
    # device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    # model.to(device)
    # X_train, y_train = X_train.to(device), y_train.to(device)

    #MAKE PREDICTION
    with torch.no_grad():
        predictions = model(X_test).cpu().numpy()

    #REVERSE SCALING THEN SAVE TO CSV
    predictions = scaler.inverse_transform(predictions)
    actuals = scaler.inverse_transform(y_test.cpu().numpy())

    df = pd.DataFrame({"Actual": actuals.flatten(), "Predicted": predictions.flatten()})
    df.to_csv(f"{ticker}_predictions.csv", index=False)
    print(f"Predictions saved to {ticker}_predictions.csv")

    return actuals, predictions

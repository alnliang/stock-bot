# train.py

import torch
import torch.nn as nn
from torch.optim import Adam
import numpy as np
import os

from model import StockLSTM
from data_loader import prepare_data

def train_model(
    ticker,
    start_date,
    end_date,
    seq_length=50,
    hidden_size=64,
    num_layers=2,
    dropout=0.2,
    learning_rate=1e-3,
    epochs=50,
    patience=5,
    save_path="lstm_stock_model.pth"
):
    """
    Trains the LSTM model on data fetched for 'ticker' from 'start_date' to 'end_date'.
    Uses an early stopping mechanism based on validation loss.
    
    Returns:
      - best_model (nn.Module): The trained model with best validation performance
      - scaler, target_scaler : For inverse transformation later
    """
    
    # PREPARE DATA
    X_train, y_train, X_val, y_val, X_test, y_test, scaler, target_scaler = prepare_data(
        ticker,
        start_date,
        end_date,
        seq_length=seq_length
    )
    
    # MODEL INSTANTIATION
    input_size = X_train.shape[2]  # Should be 8 if we used [Open, High, Low, Close, Volume, SMA_5, SMA_20, RSI]
    model = StockLSTM(
        input_size=input_size,
        hidden_size=hidden_size,
        num_layers=num_layers,
        output_size=1,
        dropout=dropout
    )
    
    # LOSS FUNCTION & OPTIMIZER
    criterion = nn.MSELoss()
    optimizer = Adam(model.parameters(), lr=learning_rate)
    
    # DEVICE CONFIG
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    
    X_train, y_train = X_train.to(device), y_train.to(device)
    X_val, y_val     = X_val.to(device), y_val.to(device)
    X_test, y_test   = X_test.to(device), y_test.to(device)
    
    best_val_loss = float("inf")
    best_model_state = None
    epochs_no_improve = 0
    
    for epoch in range(1, epochs + 1):
        model.train()
        optimizer.zero_grad()
        
        # FORWARD PASS
        outputs = model(X_train)
        loss = criterion(outputs, y_train)
        
        # BACKWARD PASS
        loss.backward()
        optimizer.step()
        
        # VALIDATION
        model.eval()
        with torch.no_grad():
            val_outputs = model(X_val)
            val_loss = criterion(val_outputs, y_val).item()
        
        print(f"Epoch [{epoch}/{epochs}] - Train Loss: {loss.item():.6f} | Val Loss: {val_loss:.6f}")
        
        # EARLY STOPPING CHECK
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_model_state = model.state_dict()
            epochs_no_improve = 0
        else:
            epochs_no_improve += 1
            if epochs_no_improve >= patience:
                print(f"Early stopping on epoch {epoch}")
                break
    
    # LOAD BEST MODEL
    if best_model_state is not None:
        model.load_state_dict(best_model_state)
    
    # SAVE MODEL
    torch.save(model.state_dict(), save_path)
    print(f"Best model saved to {save_path} with Val Loss: {best_val_loss:.6f}")
    
    return model, scaler, target_scaler

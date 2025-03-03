import torch
import torch.nn as nn
from torch.optim import Adam
from sklearn.model_selection import TimeSeriesSplit
import joblib

from model import StockLSTM
from data_loader import prepare_data

def train_model(ticker,
                start_date,
                end_date,
                seq_length=50,
                hidden_size=128,
                num_layers=2,
                dropout=0.2,
                learning_rate=1e-4,
                epochs=100,
                n_splits=5):
    """
    Trains an LSTM model on the entire dataset (X, y) using TimeSeriesSplit cross-validation.
    Saves the best model to 'lstm_{ticker}_model.pth' and scalers to 'feature_scaler_{ticker}.pkl'
    and 'target_scaler_{ticker}.pkl'.

    Returns:
      - model (nn.Module): The best model across folds
      - feature_scaler (MinMaxScaler)
      - target_scaler (MinMaxScaler)
    """

    # 1) LOAD AND PREPARE DATA
    #    prepare_data returns: X (all features), y (all targets),
    #    plus scalers. No manual train/val/test splitting here.
    X, y, feature_scaler, target_scaler = prepare_data(
        ticker, start_date, end_date, seq_length
    )

    # 2) SET UP CROSS-VALIDATION
    tscv = TimeSeriesSplit(n_splits=n_splits)
    best_val_loss = float('inf')
    best_model_state = None
    model = None

    input_size = X.shape[2]  # Number of features after sequence creation

    # 3) CROSS-VALIDATION LOOP
    for fold, (train_idx, val_idx) in enumerate(tscv.split(X)):
        # Instantiate a fresh model for each fold
        local_model = StockLSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            output_size=1,
            dropout=dropout
        )

        criterion = nn.MSELoss()
        optimizer = Adam(local_model.parameters(), lr=learning_rate)

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        local_model.to(device)

        # Split data for this fold
        X_train_fold = X[train_idx].to(device)
        y_train_fold = y[train_idx].to(device)
        X_val_fold   = X[val_idx].to(device)
        y_val_fold   = y[val_idx].to(device)

        local_best_val_loss = float("inf")

        # 4) TRAINING LOOP (with no explicit early stopping)
        for epoch in range(1, epochs + 1):
            local_model.train()
            optimizer.zero_grad()

            outputs = local_model(X_train_fold)
            loss = criterion(outputs, y_train_fold)
            loss.backward()
            optimizer.step()

            # Validation
            local_model.eval()
            with torch.no_grad():
                val_outputs = local_model(X_val_fold)
                val_loss = criterion(val_outputs, y_val_fold).item()

            # Track the best validation loss for this fold
            if val_loss < local_best_val_loss:
                local_best_val_loss = val_loss

                # Also track global best across all folds
                if val_loss < best_val_loss:
                    best_val_loss = val_loss
                    best_model_state = local_model.state_dict()

        print(f"Fold {fold+1}/{n_splits} - Best Val Loss: {local_best_val_loss:.6f}")

    # 5) LOAD THE BEST MODEL STATE ACROSS ALL FOLDS
    if best_model_state is not None:
        model = StockLSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            output_size=1,
            dropout=dropout
        )
        model.load_state_dict(best_model_state)

        # 6) SAVE THE MODEL AND SCALERS, APPENDING THE TICKER NAME
        best_model_filename = f"lstm_{ticker}_model.pth"
        torch.save(model.state_dict(), best_model_filename)
        print(f"Best model across folds saved to {best_model_filename} with Val Loss: {best_val_loss:.6f}")

        feature_scaler_filename = f"feature_scaler_{ticker}.pkl"
        target_scaler_filename  = f"target_scaler_{ticker}.pkl"
        joblib.dump(feature_scaler, feature_scaler_filename)
        joblib.dump(target_scaler,  target_scaler_filename)
        print(f"Scalers saved as '{feature_scaler_filename}' and '{target_scaler_filename}'")

    # Return the final model and scalers
    return model, feature_scaler, target_scaler

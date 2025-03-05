import torch
import torch.nn as nn
from torch.optim import Adam
from sklearn.model_selection import TimeSeriesSplit
from sklearn.preprocessing import MinMaxScaler
import joblib
import numpy as np

from model import StockLSTM
from data_loader import prepare_raw_data, create_sequences

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
    1) Fetch raw data (no scaling).
    2) TimeSeriesSplit into folds.
    3) For each fold:
        - Fit scalers on train portion
        - Create scaled train sequences, train
        - Create scaled val sequences, validate
        - Track best overall model
    4) Retrain final model on the entire dataset (using the no-leak approach):
        - Fit scaler on the entire dataset (in time order)
        - Train with all data
        - Save final model & scalers
    5) Return final model and scalers
    """
    import pandas as pd

    # 1) Load raw data
    df = prepare_raw_data(ticker, start_date, end_date)
    if df.empty or len(df) < seq_length + 1:
        print(f"[ERROR] Not enough data to train for {ticker}.")
        return None, None, None

    # Let's define the feature columns (and target = 'Close'):
    feature_cols = [
        "Open", "High", "Low", "Close", "Volume",
        "SMA_5", "SMA_20", "RSI", "EMA_20",
        "MACD", "MACD_Signal", "BB_high", "BB_low"
    ]
    df_features = df[feature_cols].values  # shape (N, 13)
    df_target = df["Close"].values         # shape (N,)

    # We'll do a single index array to feed TimeSeriesSplit
    indices = np.arange(len(df))

    # 2) Set up cross-validation
    tscv = TimeSeriesSplit(n_splits=n_splits)
    best_val_loss = float("inf")
    best_model_state = None

    input_size = len(feature_cols)

    # 3) CROSS-VALIDATION LOOP
    fold_number = 0
    for train_idx, val_idx in tscv.split(indices):
        fold_number += 1

        # 3a) Fit scalers only on the training slice
        train_features = df_features[train_idx]
        train_target   = df_target[train_idx].reshape(-1,1)

        val_features = df_features[val_idx]
        val_target   = df_target[val_idx].reshape(-1,1)

        feature_scaler = MinMaxScaler()
        target_scaler  = MinMaxScaler()

        # Fit on training only
        feature_scaler.fit(train_features)
        target_scaler.fit(train_target)

        # Transform both train and val
        train_features_scaled = feature_scaler.transform(train_features)
        train_target_scaled   = target_scaler.transform(train_target)

        val_features_scaled   = feature_scaler.transform(val_features)
        val_target_scaled     = target_scaler.transform(val_target)

        # 3b) Create sequences for train & val
        X_train_seq, y_train_seq = create_sequences(train_features_scaled, train_target_scaled, seq_length)
        X_val_seq,   y_val_seq   = create_sequences(val_features_scaled, val_target_scaled, seq_length)

        if len(X_train_seq) == 0 or len(X_val_seq) == 0:
            print(f"[WARNING] Fold {fold_number} has insufficient sequence data. Skipping.")
            continue

        # Convert to torch
        X_train_t = torch.tensor(X_train_seq, dtype=torch.float32)
        y_train_t = torch.tensor(y_train_seq, dtype=torch.float32)
        X_val_t   = torch.tensor(X_val_seq, dtype=torch.float32)
        y_val_t   = torch.tensor(y_val_seq, dtype=torch.float32)

        # 3c) Model, criterion, optimizer
        local_model = StockLSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            output_size=1,
            dropout=dropout
        )
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        local_model.to(device)

        criterion = nn.MSELoss()
        optimizer = Adam(local_model.parameters(), lr=learning_rate)

        X_train_t = X_train_t.to(device)
        y_train_t = y_train_t.to(device)
        X_val_t   = X_val_t.to(device)
        y_val_t   = y_val_t.to(device)

        # 3d) Train loop
        local_best_val_loss = float("inf")
        for epoch in range(1, epochs + 1):
            local_model.train()
            optimizer.zero_grad()

            outputs = local_model(X_train_t)
            loss = criterion(outputs, y_train_t)
            loss.backward()
            optimizer.step()

            # Validation
            local_model.eval()
            with torch.no_grad():
                val_outputs = local_model(X_val_t)
                val_loss = criterion(val_outputs, y_val_t).item()

            if val_loss < local_best_val_loss:
                local_best_val_loss = val_loss

                # Also track global best
                if val_loss < best_val_loss:
                    best_val_loss = val_loss
                    best_model_state = local_model.state_dict()

        print(f"Fold {fold_number}/{n_splits} - Best Val Loss: {local_best_val_loss:.6f}")

    # 4) RETRAIN FINAL MODEL ON ALL DATA (no leak approach):
    # Sort df by time just to be sure
    df.sort_index(inplace=True)  # ensures chronological order
    full_features = df_features
    full_target   = df_target.reshape(-1,1)

    # Fit final scalers on *all* data (still time-ordered, but presumably "historical" only)
    final_feature_scaler = MinMaxScaler()
    final_target_scaler  = MinMaxScaler()

    final_feature_scaler.fit(full_features)
    final_target_scaler.fit(full_target)

    full_features_scaled = final_feature_scaler.transform(full_features)
    full_target_scaled   = final_target_scaler.transform(full_target)

    X_full_seq, y_full_seq = create_sequences(full_features_scaled, full_target_scaled, seq_length)

    if best_model_state is None or len(X_full_seq) == 0:
        print("[ERROR] No valid folds or sequences to finalize training.")
        return None, None, None

    X_full_t = torch.tensor(X_full_seq, dtype=torch.float32)
    y_full_t = torch.tensor(y_full_seq, dtype=torch.float32)

    # Build a fresh model with the best hyperparameters
    final_model = StockLSTM(
        input_size=input_size,
        hidden_size=hidden_size,
        num_layers=num_layers,
        output_size=1,
        dropout=dropout
    )
    final_model.load_state_dict(best_model_state)  # start from best state
    final_model.to(device)

    criterion = nn.MSELoss()
    optimizer = Adam(final_model.parameters(), lr=learning_rate)

    X_full_t = X_full_t.to(device)
    y_full_t = y_full_t.to(device)

    # Optionally do a few more epochs on all data
    # (You can skip or reduce if you prefer not to "retrain" after CV.)
    extra_epochs = 5
    for ep in range(1, extra_epochs + 1):
        final_model.train()
        optimizer.zero_grad()
        out = final_model(X_full_t)
        loss = criterion(out, y_full_t)
        loss.backward()
        optimizer.step()
    # We don’t strictly do a “val” now, because the “val” was in CV.

    # 5) SAVE the final model and scalers
    best_model_filename = f"lstm_{ticker}_model.pth"
    torch.save(final_model.state_dict(), best_model_filename)
    print(f"Final model saved to {best_model_filename} with CV Best Val Loss: {best_val_loss:.6f}")

    feature_scaler_filename = f"feature_scaler_{ticker}.pkl"
    target_scaler_filename  = f"target_scaler_{ticker}.pkl"
    joblib.dump(final_feature_scaler, feature_scaler_filename)
    joblib.dump(final_target_scaler,  target_scaler_filename)
    print(f"Final scalers saved as '{feature_scaler_filename}' and '{target_scaler_filename}'")

    return final_model, final_feature_scaler, final_target_scaler

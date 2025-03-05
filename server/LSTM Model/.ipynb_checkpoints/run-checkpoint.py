# run.py

import matplotlib.pyplot as plt
from train import train_model
from test import evaluate_model

def main():
    # Example usage of training and testing with multi-feature LSTM
    
    # 1) TRAIN THE MODEL
    ticker = "AAPL"
    start_date = "2022-01-01"
    end_date = "2024-01-01"
    
    # Tune these hyperparams as desired
    model, scaler, target_scaler = train_model(
        ticker=ticker,
        start_date=start_date,
        end_date=end_date,
        seq_length=50,
        hidden_size=64,
        num_layers=2,
        dropout=0.2,
        learning_rate=1e-3,
        epochs=30,  # Increase if needed
        patience=5,
        save_path="lstm_stock_model.pth"
    )
    
    # 2) TEST/EVALUATE
    actuals, predictions = evaluate_model(
        ticker=ticker,
        start_date=start_date,
        end_date=end_date,
        seq_length=50,
        model_path="lstm_stock_model.pth"
    )
    
    # 3) PLOT
    plt.figure(figsize=(12, 6))
    plt.plot(actuals, label="Actual")
    plt.plot(predictions, label="Predicted")
    plt.title(f"{ticker} Stock Price Prediction (Multi-Feature LSTM)")
    plt.xlabel("Test samples (days)")
    plt.ylabel("Price")
    plt.legend()
    plt.show()

if __name__ == "__main__":
    main()

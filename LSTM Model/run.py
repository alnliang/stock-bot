import matplotlib.pyplot as plt
import datetime

from train import train_model
from test import evaluate_model

def main():
    ticker = "NVDA"

    today = datetime.date.today()
    start_date = (today.replace(year=today.year - 2)).strftime("%Y-%m-%d")
    end_date   = today.strftime("%Y-%m-%d")

    print(f"Training and evaluating for {ticker}, from {start_date} to {end_date}...")

    # 1) Train the model (with cross-validation)
    model, feature_scaler, target_scaler = train_model(
        ticker=ticker,
        start_date=start_date,
        end_date=end_date,
        seq_length=50,
        hidden_size=128,
        num_layers=2,
        dropout=0.2,
        learning_rate=1e-4,
        epochs=100,
        n_splits=5
    )

    if model is None:
        print("[ERROR] Training failed or not enough data.")
        return

    # 2) Evaluate the model on a final test portion (e.g., last 20% of data)
    model_path = f"lstm_{ticker}_model.pth"

    actuals, predictions = evaluate_model(
        ticker=ticker,
        start_date=start_date,
        end_date=end_date,
        seq_length=50,
        model_path=model_path,
        test_ratio=0.2
    )

    if actuals is not None and predictions is not None and len(actuals) == len(predictions):
        plt.figure(figsize=(12, 6))
        plt.plot(actuals, label="Actual Prices")
        plt.plot(predictions, label="Predicted Prices")
        plt.title(f"{ticker} Stock Price Prediction")
        plt.xlabel("Days in Test Portion")
        plt.ylabel("Price")
        plt.legend()
        plt.show()

if __name__ == "__main__":
    main()

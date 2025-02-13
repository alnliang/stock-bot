from train import train_model
from test import evaluate_model
import matplotlib.pyplot as plt

#SET STOCK TICKER AND TIME FRAME
ticker = "AAPL"
start_date = "2023-01-01"
end_date = "2024-01-01"

#TRAIN THE MODEL
model, scaler = train_model(ticker, start_date, end_date, epochs=20)

#EVALUATE THE MODEL
actuals, predictions = evaluate_model(ticker, start_date, end_date)

#PLOT PRICE VS PREDICTION
plt.figure(figsize=(12, 6))
plt.plot(actuals, label="Actual Prices")
plt.plot(predictions, label="Predicted Prices")
plt.legend()
plt.title(f"{ticker} Stock Price Prediction")
plt.xlabel("Days")
plt.ylabel("Price")
plt.show()

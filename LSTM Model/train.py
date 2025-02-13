import torch
import torch.optim as optim
import torch.nn as nn
from model import StockLSTM
from data_loader import fetch_stock_data, prepare_data

#TRAINING THE MODEL 
def train_model(ticker, start_date, end_date, seq_length=50, epochs=20, lr=0.001):
    #LOAD DATA
    data = fetch_stock_data(ticker, start_date, end_date)

    #PREPARE DATA
    X_train, y_train, X_test, y_test, scaler = prepare_data(data, seq_length)
    
    #INITIALIZE MODEL, FUNCTION, AND LOSS
    model = StockLSTM()
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    
    # #MOVE TO GPU IF AVAILABLE (only for nvidia GPUs)
    # device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    # model.to(device)
    # X_train, y_train = X_train.to(device), y_train.to(device)

    #TRAINING
    for epoch in range(epochs):
        model.train()
        optimizer.zero_grad()
        outputs = model(X_train)
        loss = criterion(outputs, y_train)
        loss.backward()
        optimizer.step()
        
        if (epoch+1) % 5 == 0:
            print(f"Epoch {epoch+1}/{epochs}, Loss: {loss.item():.6f}")

    #SAVE THE TRAINED MODEL
    torch.save(model.state_dict(), "lstm_stock_model.pth")
    return model, scaler

# model.py

import torch.nn as nn
import torch

class StockLSTM(nn.Module):
    def __init__(self, input_size=8, hidden_size=64, num_layers=2, output_size=1, dropout=0.2):
        """
        input_size=8  (Open, High, Low, Close, Volume, SMA_5, SMA_20, RSI)
        hidden_size=64 (hyperparameter to tune)
        num_layers=2   (number of stacked LSTM layers)
        output_size=1  (predict next day's close)
        dropout=0.2    (dropout between LSTM layers)
        """
        super(StockLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout
        )
        
        self.fc = nn.Linear(hidden_size, output_size)
    
    def forward(self, x):
        # x shape: (batch_size, seq_length, input_size)
        
        # Initialize hidden state and cell state to zeros
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        
        # LSTM forward
        out, _ = self.lstm(x, (h0, c0))  # out: (batch_size, seq_length, hidden_size)
        
        # Take the last time step
        out = out[:, -1, :]  # (batch_size, hidden_size)
        
        # Pass through fully connected layer
        out = self.fc(out)   # (batch_size, output_size)
        return out

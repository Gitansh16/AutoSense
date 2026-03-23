import torch
import torch.nn as nn


class BiLSTMAttention(nn.Module):
    """
    Bidirectional LSTM with Attention for Scania truck failure prediction.
    
    Input:  (batch_size, sequence_length, input_size)
    Output: (batch_size, num_classes)  — raw logits
    """

    def __init__(self, input_size=105, hidden_size=160, num_classes=5):
        super(BiLSTMAttention, self).__init__()

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=1,
            batch_first=True,
            bidirectional=True
        )

        # Attention layer: maps each hidden state → scalar score
        self.attention = nn.Linear(hidden_size * 2, 1)

        # Classification head
        self.fc = nn.Sequential(
            nn.Linear(hidden_size * 2, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        # x: (batch, seq_len, features)
        lstm_out, _ = self.lstm(x)                          # (batch, seq_len, hidden*2)
        attn_weights = torch.softmax(
            self.attention(lstm_out), dim=1
        )                                                   # (batch, seq_len, 1)
        context = torch.sum(attn_weights * lstm_out, dim=1) # (batch, hidden*2)
        output = self.fc(context)                           # (batch, num_classes)
        return output


# ── Class label reference ──────────────────────────────────────────────────────
# 0  → Healthy          (time-to-failure > 48 h, or no failure)
# 1  → 48–24 h window
# 2  → 24–12 h window
# 3  → 12–6 h  window
# 4  → < 6 h  (imminent failure)
# ───────────────────────────────────────────────────────────────────────────────

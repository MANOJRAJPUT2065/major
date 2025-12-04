"""LSTM-based anomaly detection model trainer."""
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from sklearn.preprocessing import StandardScaler
import joblib


def build_lstm_model(seq_length: int = 30, features: int = 1) -> Sequential:
    """Build LSTM model for anomaly detection."""
    model = Sequential([
        LSTM(64, activation='relu', input_shape=(seq_length, features), return_sequences=True),
        Dropout(0.2),
        LSTM(32, activation='relu', return_sequences=False),
        Dropout(0.2),
        Dense(16, activation='relu'),
        Dense(features)
    ])
    
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='mse',
        metrics=['mae']
    )
    return model


def train_lstm_model(sequences: np.ndarray, epochs: int = 50, batch_size: int = 32) -> Sequential:
    """Train LSTM model on sequences."""
    model = build_lstm_model(seq_length=sequences.shape[1], features=1)
    
    # Reshape data for LSTM (samples, time steps, features)
    X_train = sequences.reshape((sequences.shape[0], sequences.shape[1], 1))
    
    # Train the model to reconstruct input
    model.fit(
        X_train, X_train,
        epochs=epochs,
        batch_size=batch_size,
        verbose=1,
        validation_split=0.2
    )
    
    return model


def detect_anomalies_lstm(model: Sequential, sequences: np.ndarray, 
                         threshold: float = 0.02) -> tuple:
    """Detect anomalies using reconstruction error."""
    X = sequences.reshape((sequences.shape[0], sequences.shape[1], 1))
    predictions = model.predict(X, verbose=0)
    
    # Calculate reconstruction error (MAE)
    errors = np.mean(np.abs(predictions - X), axis=(1, 2))
    
    # Threshold-based anomaly detection
    anomalies = errors > threshold
    
    return anomalies, errors

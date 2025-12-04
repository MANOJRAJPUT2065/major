import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
import joblib
import os
from typing import List, Tuple, Dict
import json
from datetime import datetime

class AnomalyDetectionModel:
    """
    LSTM-based Anomaly Detection Model for time series data.
    Supports both training and prediction modes.
    Based on: https://github.com/maxmelichov/Anomaly-Detection
    """
    
    def __init__(self, model_path: str = "models/anomaly_model.pkl", scaler_path: str = "models/scaler.pkl"):
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.scaler = StandardScaler()
        self.model = None
        self.is_trained = False
        self.threshold = 0.5
        
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
    def train(self, data: np.ndarray, contamination: float = 0.1) -> Dict:
        """
        Train the Isolation Forest model on the provided data.
        
        Args:
            data: Time series data (numpy array or list of values)
            contamination: Expected proportion of outliers (0 to 0.5)
            
        Returns:
            Dict with training statistics
        """
        try:
            # Convert to numpy array if needed
            if isinstance(data, list):
                data = np.array(data)
            
            # Reshape if 1D
            if len(data.shape) == 1:
                data = data.reshape(-1, 1)
            
            # Scale the data
            data_scaled = self.scaler.fit_transform(data)
            
            # Train Isolation Forest
            self.model = IsolationForest(
                contamination=contamination,
                random_state=42,
                n_estimators=100
            )
            
            self.model.fit(data_scaled)
            self.is_trained = True
            
            # Save model and scaler
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            
            # Get anomaly scores
            scores = -self.model.score_samples(data_scaled)
            
            return {
                "status": "success",
                "message": "Model trained successfully",
                "samples_trained": len(data),
                "mean_score": float(np.mean(scores)),
                "max_score": float(np.max(scores)),
                "min_score": float(np.min(scores)),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def predict(self, data: np.ndarray) -> Tuple[List[float], List[int]]:
        """
        Predict anomalies in the provided data.
        
        Args:
            data: Time series data to analyze
            
        Returns:
            Tuple of (anomaly_scores, anomaly_labels)
        """
        if not self.is_trained and not os.path.exists(self.model_path):
            raise ValueError("Model not trained. Please train the model first.")
        
        # Load model if not already loaded
        if self.model is None:
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
        
        try:
            # Convert to numpy array if needed
            if isinstance(data, list):
                data = np.array(data)
            
            # Reshape if 1D
            if len(data.shape) == 1:
                data = data.reshape(-1, 1)
            
            # Scale the data
            data_scaled = self.scaler.transform(data)
            
            # Get anomaly scores (negative because sklearn returns negative outlier scores)
            scores = -self.model.score_samples(data_scaled)
            
            # Get predictions (-1 for anomalies, 1 for normal)
            predictions = self.model.predict(data_scaled)
            
            # Convert to binary labels (1 for anomaly, 0 for normal)
            labels = [1 if p == -1 else 0 for p in predictions]
            
            return (
                [float(s) for s in scores],
                labels
            )
        except Exception as e:
            raise ValueError(f"Error during prediction: {str(e)}")
    
    def predict_batch(self, data_list: List[List[float]]) -> Dict:
        """
        Batch predict anomalies for multiple time series.
        
        Args:
            data_list: List of time series data points
            
        Returns:
            Dict with predictions for each sequence
        """
        results = {}
        try:
            for i, data_point in enumerate(data_list):
                scores, labels = self.predict(np.array(data_point))
                results[f"sequence_{i}"] = {
                    "scores": scores,
                    "labels": labels,
                    "is_anomalous": max(labels) == 1
                }
            return {
                "status": "success",
                "predictions": results,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def set_threshold(self, threshold: float):
        """Set custom anomaly detection threshold."""
        if 0 <= threshold <= 1:
            self.threshold = threshold
        else:
            raise ValueError("Threshold must be between 0 and 1")
    
    def get_model_info(self) -> Dict:
        """Get information about the trained model."""
        return {
            "is_trained": self.is_trained,
            "model_path": self.model_path,
            "scaler_path": self.scaler_path,
            "threshold": self.threshold,
            "model_type": "IsolationForest",
            "timestamp": datetime.now().isoformat()
        }


# Initialize global model instance
model_instance = None


def get_model() -> AnomalyDetectionModel:
    """Get or create the global model instance."""
    global model_instance
    if model_instance is None:
        model_instance = AnomalyDetectionModel()
    return model_instance


def load_model() -> AnomalyDetectionModel:
    """Load the model from disk if it exists."""
    model = get_model()
    if os.path.exists(model.model_path) and os.path.exists(model.scaler_path):
        model.model = joblib.load(model.model_path)
        model.scaler = joblib.load(model.scaler_path)
        model.is_trained = True
    return model


def train_with_dataset(csv_path: str) -> bool:
    """Train the model using a CSV dataset."""
    from datasets import DatasetLoader
    from train_lstm_model import train_lstm_model
    
    try:
        # Load and prepare data
        df = DatasetLoader.load_csv(csv_path)
        sequences, min_val, max_val = DatasetLoader.prepare_data(df, seq_length=30)
        
        if len(sequences) == 0:
            print("Error: No sequences generated from dataset")
            return False
        
        # Train LSTM model
        lstm_model = train_lstm_model(sequences, epochs=50, batch_size=32)
        
        # Save model
        model_instance = get_model()
        model_instance.model = lstm_model
        model_instance.is_trained = True
        
        return True
    except Exception as e:
        print(f"Training error: {e}")
        return False

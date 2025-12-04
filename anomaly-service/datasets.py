"""Dataset utilities for anomaly detection."""
import pandas as pd
import numpy as np
from typing import Tuple, List
import io


class DatasetLoader:
    """Load and preprocess datasets for anomaly detection."""
    
    @staticmethod
    def load_csv(file_path: str) -> pd.DataFrame:
        """Load CSV dataset."""
        return pd.read_csv(file_path)
    
    @staticmethod
    def load_from_string(csv_string: str) -> pd.DataFrame:
        """Load dataset from CSV string."""
        return pd.read_csv(io.StringIO(csv_string))
    
    @staticmethod
    def normalize_data(data: np.ndarray) -> Tuple[np.ndarray, float, float]:
        """Normalize data using min-max scaling."""
        min_val = np.min(data)
        max_val = np.max(data)
        normalized = (data - min_val) / (max_val - min_val + 1e-8)
        return normalized, min_val, max_val
    
    @staticmethod
    def create_sequences(data: np.ndarray, seq_length: int = 30) -> np.ndarray:
        """Create sequences for LSTM training."""
        sequences = []
        for i in range(len(data) - seq_length + 1):
            sequences.append(data[i:i + seq_length])
        return np.array(sequences)
    
    @staticmethod
    def prepare_data(df: pd.DataFrame, seq_length: int = 30, 
                    column: str = None) -> Tuple[np.ndarray, float, float]:
        """Prepare data for model training."""
        if column is None:
            column = df.columns[0]
        
        data = df[column].values.reshape(-1, 1).astype(float)
        data = data.flatten()
        
        normalized_data, min_val, max_val = DatasetLoader.normalize_data(data)
        sequences = DatasetLoader.create_sequences(normalized_data, seq_length)
        
        return sequences, min_val, max_val

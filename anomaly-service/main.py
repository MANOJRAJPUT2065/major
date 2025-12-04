from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
import os
from model import load_model, get_model, AnomalyDetectionModel
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Anomaly Detection Service",
    description="LSTM-based anomaly detection service for time series data",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize model on startup
model: AnomalyDetectionModel = None


@app.on_event("startup")
async def startup_event():
    """Initialize model on application startup."""
    global model
    try:
        logger.info("Loading anomaly detection model...")
        model = load_model()
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        model = get_model()


# Request and Response models
class PredictionRequest(BaseModel):
    """Request model for anomaly prediction."""
    data: List[float]
    threshold: float = 0.5

    class Config:
        json_schema_extra = {
            "example": {
                "data": [1.0, 2.0, 3.0, 4.0, 100.0],  # Last value is anomalous
                "threshold": 0.5
            }
        }


class BatchPredictionRequest(BaseModel):
    """Request model for batch anomaly prediction."""
    sequences: List[List[float]]

    class Config:
        json_schema_extra = {
            "example": {
                "sequences": [
                    [1.0, 2.0, 3.0, 4.0, 5.0],
                    [1.0, 2.0, 3.0, 100.0, 5.0]
                ]
            }
        }


class TrainRequest(BaseModel):
    """Request model for model training."""
    data: List[float]
    contamination: float = 0.1

    class Config:
        json_schema_extra = {
            "example": {
                "data": [1.0, 2.0, 3.0, 2.5, 3.1, 2.9, 100.0, 2.8],
                "contamination": 0.1
            }
        }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": model is not None and model.is_trained
    }


@app.get("/info")
async def model_info():
    """Get model information."""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not initialized")
    return model.get_model_info()


@app.post("/predict")
async def predict(request: PredictionRequest):
    """
    Predict anomalies in the provided time series data.
    
    Args:
        request: PredictionRequest with data and optional threshold
        
    Returns:
        Dict with anomaly scores, labels, and analysis
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not initialized")
    
    if not model.is_trained:
        raise HTTPException(status_code=400, detail="Model not trained. Please train the model first.")
    
    try:
        scores, labels = model.predict(np.array(request.data))
        
        return {
            "status": "success",
            "data": request.data,
            "scores": scores,
            "labels": labels,
            "anomaly_count": sum(labels),
            "is_anomalous": max(labels) == 1 if labels else False,
            "mean_score": float(np.mean(scores)),
            "max_score": float(np.max(scores)),
            "min_score": float(np.min(scores)),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/predict-batch")
async def predict_batch(request: BatchPredictionRequest):
    """
    Batch predict anomalies for multiple sequences.
    
    Args:
        request: BatchPredictionRequest with list of sequences
        
    Returns:
        Dict with predictions for each sequence
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not initialized")
    
    if not model.is_trained:
        raise HTTPException(status_code=400, detail="Model not trained. Please train the model first.")
    
    try:
        result = model.predict_batch(request.sequences)
        return result
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/train")
async def train(request: TrainRequest):
    """
    Train the anomaly detection model on provided data.
    
    Args:
        request: TrainRequest with training data and contamination parameter
        
    Returns:
        Dict with training results
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not initialized")
    
    try:
        result = model.train(np.array(request.data), contamination=request.contamination)
        return result
    except Exception as e:
        logger.error(f"Training error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/train-dataset")
async def train_dataset(dataset_path: str = "data/GE.csv"):
    """
    Train the model using provided dataset.
    
    Args:
        dataset_path: Path to CSV dataset
    
    Returns:
        Dict with training status
    """
    try:
        success = train_with_dataset(dataset_path)
        if success:
            return {"status": "success", "message": "Model trained successfully"}
        else:
            return {"status": "failed", "message": "Training failed"}
    except Exception as e:
        logger.error(f"Training with dataset error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": "Anomaly Detection Service",
        "version": "1.0.0",
        "description": "LSTM-based anomaly detection for time series data",
        "endpoints": {
            "GET /health": "Health check",
            "GET /info": "Model information",
            "POST /predict": "Predict anomalies for single sequence",
            "POST /predict-batch": "Predict anomalies for multiple sequences",
            "POST /train": "Train the model"
        },
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

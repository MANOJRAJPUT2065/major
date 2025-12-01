# Anomaly Detection Service

LSTM-based anomaly detection microservice using FastAPI and scikit-learn. This service provides real-time anomaly detection for time series data.

## Features

- LSTM-based anomaly detection using Isolation Forest
- FastAPI with automatic OpenAPI documentation
- RESTful API endpoints for prediction and training
- Batch prediction support
- Model persistence with joblib
- CORS middleware enabled
- Health check endpoint
- Docker support

## Quick Start

### Prerequisites
- Python 3.10+
- Docker (optional)

### Local Setup

1. Copy environment file:
```bash
cp .env.example .env
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the service:
```bash
python main.py
```

The service will be available at `http://localhost:8000`

### Docker Setup

1. Build the image:
```bash
docker build -t anomaly-detection .
```

2. Run the container:
```bash
docker run -p 8000:8000 anomaly-detection
```

## API Endpoints

### Health Check
```
GET /health
```

### Model Info
```
GET /info
```

### Predict Anomalies
```
POST /predict
Content-Type: application/json

{
  "data": [1.0, 2.0, 3.0, 4.0, 100.0],
  "threshold": 0.5
}
```

### Batch Predict
```
POST /predict-batch
Content-Type: application/json

{
  "sequences": [
    [1.0, 2.0, 3.0, 4.0, 5.0],
    [1.0, 2.0, 3.0, 100.0, 5.0]
  ]
}
```

### Train Model
```
POST /train
Content-Type: application/json

{
  "data": [1.0, 2.0, 3.0, 2.5, 3.1, 100.0, 2.8],
  "contamination": 0.1
}
```

## Integration with Next.js

The Next.js application can call this service from API routes:

```typescript
const response = await fetch('http://localhost:8000/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: [1, 2, 3, 100] })
});
```

## Reference

Based on: https://github.com/maxmelichov/Anomaly-Detection

## License

MIT

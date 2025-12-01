import { NextRequest, NextResponse } from 'next/server';

const ANOMALY_SERVICE_URL = process.env.ANOMALY_SERVICE_URL || 'http://localhost:8000';

interface PredictionRequest {
  data: number[];
  threshold?: number;
}

interface TrainRequest {
  data: number[];
  contamination?: number;
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${ANOMALY_SERVICE_URL}/health`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to connect to anomaly detection service' },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, contamination, threshold } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    let endpoint = '';
    let payload: PredictionRequest | TrainRequest = { data };

    switch (action) {
      case 'predict':
        endpoint = '/predict';
        if (threshold !== undefined) {
          (payload as PredictionRequest).threshold = threshold;
        }
        break;

      case 'predict-batch':
        endpoint = '/predict-batch';
        payload = { data } as any;
        break;

      case 'train':
        endpoint = '/train';
        if (contamination !== undefined) {
          (payload as TrainRequest).contamination = contamination;
        }
        break;

      case 'info':
        endpoint = '/info';
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    const response = await fetch(`${ANOMALY_SERVICE_URL}${endpoint}`, {
      method: action === 'info' ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: action === 'info' ? undefined : JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Anomaly detection error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

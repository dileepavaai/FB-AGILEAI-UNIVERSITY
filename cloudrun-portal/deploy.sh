#!/usr/bin/env bash
set -e

SERVICE_NAME="aaiu-cloudrun-backend"
REGION="asia-south1"
PROJECT="fb-agileai-university"

echo "🚀 Starting safe deploy for $SERVICE_NAME"

npm install
npm run check:deps
npm run check:port

gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --project $PROJECT \
  --allow-unauthenticated

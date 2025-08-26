#!/bin/bash

# Cloud Run FFmpeg Service Deployment Script
# Make sure you have gcloud CLI installed and authenticated

# Configuration
PROJECT_ID="static-groove-464313-t4"
SERVICE_NAME="ffmpeg-video-merger"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment of FFmpeg Video Merger to Cloud Run...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install it first.${NC}"
    exit 1
fi

# Set the project
echo -e "${YELLOW}Setting project to ${PROJECT_ID}...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${YELLOW}Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build the Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Docker build failed${NC}"
    exit 1
fi

# Push the image to Google Container Registry
echo -e "${YELLOW}Pushing image to Google Container Registry...${NC}"
docker push $IMAGE_NAME

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Docker push failed${NC}"
    exit 1
fi

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 3600 \
    --concurrency 10 \
    --max-instances 100 \
    --set-env-vars="STORAGE_BUCKET=static-groove-464313-t4.appspot.com"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deployment successful!${NC}"
    
    # Get the service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
    echo -e "${GREEN}Service URL: ${SERVICE_URL}${NC}"
    echo -e "${GREEN}Health check: ${SERVICE_URL}/health${NC}"
    echo -e "${GREEN}Merge endpoint: ${SERVICE_URL}/merge-videos${NC}"
else
    echo -e "${RED}Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}Deployment complete!${NC}"
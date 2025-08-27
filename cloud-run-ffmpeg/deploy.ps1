# PowerShell deployment script for FFmpeg Cloud Run service
# This is the Windows PowerShell equivalent of deploy.sh

# Configuration
$PROJECT_ID = "vidzyme"
$SERVICE_NAME = "ffmpeg-video-merger"
$REGION = "us-central1"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"
$STORAGE_BUCKET = "vidzyme.appspot.com"

Write-Host "Starting FFmpeg Cloud Run deployment..." -ForegroundColor Green
Write-Host "Project: $PROJECT_ID" -ForegroundColor Cyan
Write-Host "Service: $SERVICE_NAME" -ForegroundColor Cyan
Write-Host "Region: $REGION" -ForegroundColor Cyan

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version 2>$null
    Write-Host "Google Cloud CLI found" -ForegroundColor Green
} catch {
    Write-Host "Google Cloud CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   https://cloud.google.com/sdk/docs/install-sdk#windows" -ForegroundColor Yellow
    Write-Host "   Or use the web-based deployment option in QUICK_DEPLOYMENT_SETUP.md" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is installed
try {
    $dockerVersion = docker --version 2>$null
    Write-Host "Docker found" -ForegroundColor Green
} catch {
    Write-Host "Docker not found. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Set the project
Write-Host "Setting Google Cloud project..." -ForegroundColor Blue
gcloud config set project $PROJECT_ID
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to set project. Please check your authentication." -ForegroundColor Red
    exit 1
}

# Enable required APIs
Write-Host "Enabling required APIs..." -ForegroundColor Blue
$apis = @(
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "containerregistry.googleapis.com"
)

foreach ($api in $apis) {
    Write-Host "   Enabling $api..." -ForegroundColor Gray
    gcloud services enable $api
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to enable $api" -ForegroundColor Red
        exit 1
    }
}

# Configure Docker for GCR
Write-Host "Configuring Docker for Google Container Registry..." -ForegroundColor Blue
gcloud auth configure-docker
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to configure Docker authentication" -ForegroundColor Red
    exit 1
}

# Build the Docker image
Write-Host "Building Docker image..." -ForegroundColor Blue
docker build -t $SERVICE_NAME .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed" -ForegroundColor Red
    exit 1
}

# Tag the image for GCR
Write-Host "Tagging image for Google Container Registry..." -ForegroundColor Blue
docker tag $SERVICE_NAME $IMAGE_NAME
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to tag image" -ForegroundColor Red
    exit 1
}

# Push the image to GCR
Write-Host "Pushing image to Google Container Registry..." -ForegroundColor Blue
docker push $IMAGE_NAME
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to push image" -ForegroundColor Red
    exit 1
}

# Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..." -ForegroundColor Blue
gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_NAME `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --memory 1Gi `
    --cpu 1 `
    --timeout 3600 `
    --concurrency 10 `
    --max-instances 5 `
    --set-env-vars "STORAGE_BUCKET=$STORAGE_BUCKET"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Cloud Run deployment failed" -ForegroundColor Red
    exit 1
}

# Get the service URL
Write-Host "Getting service URL..." -ForegroundColor Blue
$serviceUrl = gcloud run services describe $SERVICE_NAME --region $REGION --format "value(status.url)"

if ($serviceUrl) {
    Write-Host "" 
    Write-Host "Deployment successful!" -ForegroundColor Green
    Write-Host "" 
    Write-Host "Service URL: $serviceUrl" -ForegroundColor Cyan
    Write-Host "" 
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update your .env file with:" -ForegroundColor Gray
    Write-Host "   FFMPEG_SERVICE_URL=$serviceUrl" -ForegroundColor White
    Write-Host "" 
    Write-Host "2. Test the service:" -ForegroundColor Gray
    Write-Host "   Invoke-RestMethod -Uri '$serviceUrl/health' -Method Get" -ForegroundColor White
    Write-Host "" 
} else {
    Write-Host "Failed to get service URL" -ForegroundColor Red
    exit 1
}

Write-Host "Deployment completed successfully!" -ForegroundColor Green
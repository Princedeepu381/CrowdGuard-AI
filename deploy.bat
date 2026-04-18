@echo off
echo Granting roles...
call gcloud projects add-iam-policy-binding craftconnect-ai-xa950 --member="serviceAccount:362866275645-compute@developer.gserviceaccount.com" --role="roles/storage.objectAdmin" --quiet
call gcloud projects add-iam-policy-binding craftconnect-ai-xa950 --member="serviceAccount:362866275645-compute@developer.gserviceaccount.com" --role="roles/artifactregistry.writer" --quiet
call gcloud projects add-iam-policy-binding craftconnect-ai-xa950 --member="serviceAccount:362866275645-compute@developer.gserviceaccount.com" --role="roles/logging.logWriter" --quiet

echo Deploying...
call gcloud run deploy crowdguard-ai ^
  --source . ^
  --project craftconnect-ai-xa950 ^
  --region us-central1 ^
  --allow-unauthenticated ^
  --quiet

echo Deployment Complete.

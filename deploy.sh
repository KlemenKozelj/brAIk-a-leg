#!/usr/bin/env bash
# Build the static export and deploy it to S3 + CloudFront.
#
# Usage: ./deploy.sh
set -euo pipefail

cd "$(dirname "$0")"

AWS_PROFILE="privat-klemen"
S3_BUCKET="tmp.klemen.cc"
AWS_REGION="us-east-1" # actual region of the tmp.klemen.cc bucket
CLOUDFRONT_DISTRIBUTION_ID="E1WXU8CQDOKRPX"
BUILD_DIR="out"
ENV_FILE=".env.local"

export AWS_PROFILE AWS_REGION

if [[ -f "$ENV_FILE" ]]; then
  echo "Loading build env vars from $ENV_FILE"
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
else
  echo "Warning: $ENV_FILE not found, building without it" >&2
fi

echo "Building project..."
rm -rf "$BUILD_DIR" .next
npm run build

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Error: build did not produce a '$BUILD_DIR' directory (check next.config.js output mode)" >&2
  exit 1
fi

echo "Syncing $BUILD_DIR/ to s3://$S3_BUCKET ..."
aws s3 sync "$BUILD_DIR"/ "s3://$S3_BUCKET" \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION" \
  --delete

echo "Creating CloudFront invalidation for distribution $CLOUDFRONT_DISTRIBUTION_ID ..."
aws cloudfront create-invalidation \
  --profile "$AWS_PROFILE" \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*"

echo "Deploy complete."

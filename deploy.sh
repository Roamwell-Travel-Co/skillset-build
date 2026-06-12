#!/bin/bash
# deploy.sh — build and redeploy to Zero/StableUpload
set -e

echo "Building..."
npm run build

echo "Zipping..."
rm -f /tmp/skillset-deploy.zip
(cd dist && zip -r /tmp/skillset-deploy.zip . --exclude "*.DS_Store")

echo "Purchasing upload slot..."
SLOT_JSON=$(zero fetch https://stableupload.dev/api/site -X POST \
  -d '{"filename":"skillset-deploy.zip","tier":"10mb"}' 2>/dev/null | grep '^{')

UPLOAD_ID=$(echo "$SLOT_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['uploadId'])")
UPLOAD_URL=$(echo "$SLOT_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['uploadUrl'])")

echo "Uploading (id: $UPLOAD_ID)..."
curl -s -X PUT "$UPLOAD_URL" \
  -H "Content-Type: application/zip" \
  --data-binary @'/tmp/skillset-deploy.zip'

echo "Activating..."
SITE_JSON=$(zero fetch https://stableupload.dev/api/site/activate -X POST \
  -d "{\"uploadId\":\"$UPLOAD_ID\"}" 2>/dev/null | grep '^{')

SITE_URL=$(echo "$SITE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['siteUrl'])")

echo ""
echo "LIVE: $SITE_URL"

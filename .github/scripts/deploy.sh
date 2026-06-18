#!/bin/bash

ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID
TOKEN=$CLOUDFLARE_API_TOKEN
ZONE_ID=$CLOUDFLARE_ZONE_ID

npx wrangler pages project create akieniacademy-eembouz-com \
  --production-branch main || true

npx wrangler pages deploy . \
  --project-name=akieniacademy-eembouz-com

curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/akieniacademy-eembouz-com/domains" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"akieniacademy.eembouz.com\"}" || true

curl -s -X POST \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"CNAME\",\"name\":\"akieniacademy\",\"content\":\"akieniacademy-eembouz-com.pages.dev\",\"proxied\":true}" || true
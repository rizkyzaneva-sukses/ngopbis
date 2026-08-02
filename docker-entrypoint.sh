#!/bin/sh
set -e

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

npx prisma migrate deploy
node scripts/bootstrap-admin.mjs
node server.js

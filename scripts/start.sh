#!/bin/sh
set -e

# Export SANITY_API_TOKEN from Docker Swarm secret if present
if [ -f "/run/secrets/sanity_api_token" ]; then
  export SANITY_API_TOKEN="$(cat /run/secrets/sanity_api_token)"
fi

# Default to production
export NODE_ENV=${NODE_ENV:-production}
export NEXT_TELEMETRY_DISABLED=1

exec node server.js

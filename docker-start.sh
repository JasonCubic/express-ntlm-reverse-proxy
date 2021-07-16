#!/bin/bash

if [ ! -f .env ]; then
  echo "ERROR: .env file does not exist.  Exiting script."
  echo "You can rename the file .env.default to .env to resolve this error."
  exit 1
fi

set -a
# shellcheck source=.env
# shellcheck disable=SC1091
source <(sed <.env -e 's/[^[:print:]\t]//g')
set +a

docker compose down --volumes --remove-orphans

docker compose build --no-cache \
  --build-arg NODE_ENV=production \
  --build-arg HTTP_PROXY="$HTTP_PROXY" \
  --build-arg HTTPS_PROXY="$HTTPS_PROXY" \
  --build-arg EXPRESS_HOST="$EXPRESS_HOST" \
  --build-arg EXPRESS_PORT="$EXPRESS_PORT" \
  --build-arg MAX_CLUSTER_FORKS="$MAX_CLUSTER_FORKS" \
  --build-arg DOMAIN_CONTROLLER_ARR="$DOMAIN_CONTROLLER_ARR" \
  --build-arg LOG_LOCALE="$LOG_LOCALE" \
  --build-arg LOG_TIMEZONE="$LOG_TIMEZONE" \
  --build-arg LOG_LOCAL_DATE_FORMAT="$LOG_LOCAL_DATE_FORMAT" \
  --build-arg LOGGING_LEVEL="$LOGGING_LEVEL" \
  --build-arg REVERSE_PROXY_URI_CONTEXT="$REVERSE_PROXY_URI_CONTEXT" \
  --build-arg REVERSE_PROXY_TARGET_HOST="$REVERSE_PROXY_TARGET_HOST" \
  --build-arg SESSION_SECRET="$SESSION_SECRET" \
  --build-arg REDIS_HOST="$REDIS_HOST" \
  --build-arg REDIS_PORT="$REDIS_PORT" \
  --build-arg RATE_LIMIT_WINDOW_MS="$RATE_LIMIT_WINDOW_MS" \
  --build-arg RATE_LIMIT_MAX="$RATE_LIMIT_MAX" \
  --build-arg RATE_LIMIT_MESSAGE="$RATE_LIMIT_MESSAGE" \
  --build-arg SESSION_HEADER_TOKEN_FIELD_NAME="$SESSION_HEADER_TOKEN_FIELD_NAME" \
  --build-arg REVERSE_PROXY_CREATE_TOKEN_URL="$REVERSE_PROXY_CREATE_TOKEN_URL"

docker compose up

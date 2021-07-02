#!/bin/bash

if [ ! -f .env ]; then
  echo "ERROR: .env file does not exist.  Exiting script."
  echo "You can rename the file .env.default to .env to resolve this error."
  exit 1
fi

# https://gist.github.com/judy2k/7656bfe3b322d669ef75364a46327836#gistcomment-3625311
# https://stackoverflow.com/questions/43108359/how-to-remove-all-special-characters-in-linux-text/43108392#43108392
set -a
source <(cat .env | sed -e 's/[^[:print:]\t]//g')
set +a

docker stop express-ntlm-reverse-proxy

docker rm -f express-ntlm-reverse-proxy

docker rmi -f express-ntlm-reverse-proxy

docker build --no-cache \
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
  -t express-ntlm-reverse-proxy .

docker run --name express-ntlm-reverse-proxy -p $EXPRESS_PORT:$EXPRESS_PORT express-ntlm-reverse-proxy

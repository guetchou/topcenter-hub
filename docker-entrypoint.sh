#!/bin/sh
set -e

required_env_vars="DB_HOST DB_USER DB_PASSWORD DB_NAME JWT_SECRET"

for var in $required_env_vars; do
  value=$(eval "printf '%s' \"\${$var:-}\"")
  if [ -z "$value" ]; then
    echo "Required environment variable $var is not set" >&2
    exit 1
  fi
done

mkdir -p /app/logs
exec "$@"

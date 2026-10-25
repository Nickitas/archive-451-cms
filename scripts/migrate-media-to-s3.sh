#!/usr/bin/env sh
set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
env_file=${1:-.env.development}
cd "$project_dir"

if [ ! -f "$env_file" ]; then
    echo "Environment file not found: $env_file" >&2
    exit 1
fi

docker compose --env-file "$env_file" up -d minio
docker compose --env-file "$env_file" run --rm --entrypoint /bin/sh createbuckets -ec '
    attempt=0
    until mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null 2>&1; do
        attempt=$((attempt + 1))
        if [ "$attempt" -ge 30 ]; then
            echo "MinIO did not become ready within 30 seconds." >&2
            exit 1
        fi
        sleep 1
    done
    mc mb --ignore-existing "local/$S3_IMAGES_BUCKET"
    mc anonymous set public "local/$S3_IMAGES_BUCKET"
    mc mirror --overwrite --preserve /migration-media "local/$S3_IMAGES_BUCKET"
'

echo "Media copied to MinIO. Local files in media/ were kept as a rollback copy."

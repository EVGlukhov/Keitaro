#!/bin/sh
set -eu

backup_dir="${XDG_DATA_HOME:-$HOME/.local/share}/keitaro-wrapper/backups"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)-$$"
backup_path="$backup_dir/keitaro-wrapper-$timestamp.db"
container_path="/tmp/keitaro-wrapper-backup-$$.db"

mkdir -p "$backup_dir"

cleanup() {
  docker compose exec -T backend rm -f "$container_path" >/dev/null 2>&1 || true
}
trap cleanup EXIT HUP INT TERM

docker compose exec -T backend python -c '
import sqlite3
import sys

source = sqlite3.connect("file:/data/keitaro_wrapper.db?mode=ro", uri=True)
destination = sqlite3.connect(sys.argv[1])
source.backup(destination)
destination.close()
source.close()
' "$container_path"

docker compose cp "backend:$container_path" "$backup_path"
printf 'Database backup saved to %s\n' "$backup_path"

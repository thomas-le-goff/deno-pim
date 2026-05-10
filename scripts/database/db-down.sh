#!/usr/bin/env bash

set -euo pipefail

. "$PROJECT_ROOT/scripts/lib/distrobox-host.sh"

main() {
    compose="docker-compose"
    if exec_on_host command -v podman &>/dev/null; then
        compose="podman-compose"
    fi

    exec_on_host $compose -f "$PROJECT_ROOT/compose.yml" down db
}

main

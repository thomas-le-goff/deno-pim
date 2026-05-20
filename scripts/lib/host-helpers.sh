#!/usr/bin/env sh

exec_on_host() {
    if [ ! -e /run/.containerenv ] && [ ! -e /.dockerenv ]; then
        "$@"
    else
        distrobox-host-exec bash -lc '
            eval "$(/var/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
            exec "$@"
        ' bash "$@"
    fi
}

compose_cmd() {
    if exec_on_host command -v podman &>/dev/null; then
        echo "podman-compose"
    else
        echo "docker-compose"
    fi
}

container_cmd() {
    if exec_on_host command -v podman &>/dev/null; then
        echo "podman"
    else
        echo "docker"
    fi
}

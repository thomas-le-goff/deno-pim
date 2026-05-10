#!/usr/bin/env sh

exec_on_host() {
    if [ ! -e /run/.containerenv ] && [ ! -e /.dockerenv ]; then
        exec "$@"
    else
        distrobox-host-exec bash -lc '
            eval "$(/var/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
            exec "$@"
        ' bash "$@"
    fi
}

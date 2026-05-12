#!/usr/bin/env sh

# TODO: maybe add this into the whole dev container ?(using command failed hook or something similar)
# http://github.com/89luca89/distrobox/blob/main/docs/posts/execute_commands_on_host.md#bash-or-zsh
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

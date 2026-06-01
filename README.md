## Dev container

Build the image:

```sh
podman build --format docker -t deno-pim-dev -f Containerfile . -t localhost/deno-pim-dev:latest
```

Create the distrobox:

```sh
distrobox create --name deno-pim --image localhost/deno-pim-dev:latest
```

Enter it:

```sh
distrobox enter deno-pim
```

(latelly if required) update the distrobox image:

```sh
distrobox update deno-pim --image localhost/deno-pim-dev:latest
```

Included tools:

- deno
- nodejs / npm
- git
- curl
- jq
- just
- psql

Follow 12 factors app ruleset.

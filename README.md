# Deno PIM (WIP)

Simple REST API built with Deno and Fastify.

## Goals

This project is a small sample app used to demonstrate Fastify best practices
and a simple modern DevOps setup.

## Already available

- REST API built with Node and Fastify
- Integrated JWT-based first-party authentication for a stateless API
- Protected routes for the current user and product access
- Localization with Mozilla Fluent (`Accept-Language` negotiation for API
  messages)
- OpenAPI documentation with Swagger UI
- PostgreSQL integration
- SQL migrations and seed data
- `just` commands for development, database tasks, and REST tests
- REST test files for authentication and product endpoints
- Dev container, `Containerfile`, and `compose.yml`
- e2e tests using httpyac (REST API 2e2)
- OpenTelemetry logs, including Grafana dashboards (full docker compose stack)

## Planned Work

See: [TODO.org](./TODO.org)

## Justfile

Project use [just](https://github.com/casey/just) as command runner, to get the
list of available recipes:

```sh
just -l
```

## Dev container

Build the image:

```sh
podman build --format docker -t deno-pim-dev -f Containerfile . -t localhost/deno-pim-dev:latest
```

Create the Distrobox:

```sh
distrobox create --name deno-pim --image localhost/deno-pim-dev:latest
```

Enter the container:

```sh
distrobox enter deno-pim
```

Update the image if needed:

```sh
distrobox update deno-pim --image localhost/deno-pim-dev:latest
```

Included tools:

- Deno
- Node.js / npm
- Git
- curl
- jq
- just
- psql
- bat

# Deno PIM (WIP)

Simple REST API built with Deno and Fastify.

## Goals

This project is a small sample app used to demonstrate Fastify best practices and a simple modern DevOps setup.

## Already available

- REST API built with Deno and Fastify
- JWT authentication with a login endpoint
- Protected routes for the current user and product access
- OpenAPI documentation with Swagger UI
- PostgreSQL integration
- SQL migrations and seed data
- `just` commands for development, database tasks, and REST tests
- REST test files for authentication and product endpoints
- Dev container, `Containerfile`, and `compose.yml`

## Planned work

- Read/write API (for product and user management)
- Nginx integration
- Production Docker environment
- CI/CD pipeline (tests, Docker build, quality checks, dependency updates)
- Proper logging
- OpenTelemetry, including Grafana dashboards
- Dependency injection
- Migration rollback support
- WebSocket API
- More complete test coverage
- OWASP recommendations
- ANSSI recommendations
- 12-factor app recommendations
- Terraform deployment for a cloud provider

## Justfile

Project use [just](https://github.com/casey/just) as command runner, to get the list of available recipes:

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

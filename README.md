# Deno PIM (WIP)

Simple REST API built with Deno and Fastify.

## Goals

This project is a small sample app used to demonstrate Fastify best practices
and a simple modern DevOps setup.

## Already available

- REST API built with Deno and Fastify
- JWT authentication with a login endpoint
- Protected routes for the current user and product access
- Localization with Mozilla Fluent (`Accept-Language` negotiation for API
  messages)
- OpenAPI documentation with Swagger UI
- PostgreSQL integration
- SQL migrations and seed data
- `just` commands for development, database tasks, and REST tests
- REST test files for authentication and product endpoints
- Dev container, `Containerfile`, and `compose.yml`

## Planned work

- Read/write API (for product and user management)
- Properly handle SIGINT
- Refresh mecanism for better authentication
- Nginx integration
- Proper logging (cloudfirst logging)
- Production Docker environment
- CI/CD pipeline (tests, Docker build, quality checks, dependency updates)
- OpenTelemetry, including Grafana dashboards
- Dependency injection (by taking a look at awilix)
- Migration rollback support
- Swagger authentication using credentials
- Event Driven Architecture using NATS
- WebSocket API
- More complete test coverage (maybe by using node:test)
- 12-factor app recommendations
- OWASP recommendations
- ANSSI recommendations
- Terraform deployment for a specific cloud provider
- How to get AST inside of raw SQL query (in stores)
- Study and justify idempotency choices
- Send registration link to created user (email management)
- REST Client generation for TS (with full automation and publication on npm
  registry)
- Load test using autocanon (and optimization with the following reco:
  https://www.youtube.com/watch?v=VI29mUA8n9w)

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

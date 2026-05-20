set dotenv-load

# [arg("force", long="force", value="true")]
[group('Env')]
reset-env force="false":
    #!/usr/bin/env bash
    if ! [[ -f .env ]] || [[ "{{ force }}" == "true" ]]; then
        rm -f .env
        cp .env.template .env
    else
        echo "Found .env file. Pass --force to overwrite."
    fi

# Dev
[group('Dev')]
dev:
    deno run -P=dev --watch src/main.ts

# Database
[doc('Start database running in container (podman or docker)')]
[group('Database')]
db-up:
    #!/usr/bin/env bash
    . ./scripts/lib/host-helpers.sh
    exec_on_host "$(compose_cmd)" -f compose.yml up db -d

[doc('Run SQL migration files in order from scripts/database/sql/migrations/')]
[group('Database')]
db-migrate:
    #!/usr/bin/env bash
    set -euo pipefail
    for f in ./scripts/database/sql/migrations/*.sql; do
        echo "Applying migration: $(basename "$f")"
        psql "$DB_CONNECTION_STRING" -f "$f"
    done

[doc('Seed database fixtures in order from scripts/database/sql/data/')]
[group('Database')]
db-seed:
    #!/usr/bin/env bash
    set -euo pipefail
    for f in ./scripts/database/sql/data/*.sql; do
        echo "Seeding: $(basename "$f")"
        psql "$DB_CONNECTION_STRING" -f "$f"
    done

[doc('Stop database instance')]
[group('Database')]
db-down:
    #!/usr/bin/env bash
    set -euo pipefail
    . ./scripts/lib/host-helpers.sh
    exec_on_host "$(compose_cmd)" -f compose.yml down db

[doc('Open database connection using CLI')]
[group('Database')]
db-connect:
    psql $DB_CONNECTION_STRING

# Test
[doc('Run REST tests set')]
[group('Test')]
test-rest:
    #!/usr/bin/env bash
    set -euo pipefail

    . ./scripts/lib/host-helpers.sh

    test_files="$(ls ./test/rest)"

    exec_on_host "$(container_cmd)" pull docker.io/jetbrains/intellij-http-client
    exec_on_host "$(container_cmd)" run --rm --network host -v $PWD/test/rest:/workdir:Z jetbrains/intellij-http-client -D $test_files

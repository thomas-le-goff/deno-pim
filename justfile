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
    deno run --allow-env --allow-sys --allow-net --allow-read --watch src/main.ts

[group('Dev')]
fmt:
    deno fmt .
    deno lint .

[group('Dev')]
repl:
    deno repl

# Database
[doc('Start database running in container (podman or docker)')]
[group('Database')]
db-up:
    #!/usr/bin/env bash
    . ./scripts/lib/host-helpers.sh
    exec_on_host "$(compose_cmd)" -f compose.yml up db -d

[confirm]
[doc('Run SQL migration files in order from scripts/database/sql/migrations/')]
[group('Database')]
db-migrate:
    #!/usr/bin/env bash
    set -euo pipefail
    for f in ./scripts/database/sql/migrations/*.sql; do
        echo "Applying migration: $(basename "$f")"
        psql "$DB_CONNECTION_STRING" -f "$f"
    done

[confirm]
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

[confirm]
[doc('Drop database')]
[group('Database')]
db-drop:
    #!/usr/bin/env python
    from urllib.parse import urlsplit, unquote
    import os

    url = urlsplit(os.environ["DB_CONNECTION_STRING"])

    db_name = unquote(url.path.rsplit("/", 1)[-1])
    connection_string = url._replace(path="/postgres").geturl()

    os.system(f"dropdb --maintenance-db={connection_string} {db_name}")

# Test
[arg("pull", long="pull", value="true")]
[doc('Run REST tests set')]
[group('Test')]
test-rest file="" pull="false":
    #!/usr/bin/env bash
    set -euo pipefail

    . ./scripts/lib/host-helpers.sh

    if [[ "{{ file }}" == "" ]]; then
        test_files="$(ls ./test/rest)"
    else
        test_files="{{ file }}"
    fi

    if [[ "{{ pull }}" == "true" ]]; then
        exec_on_host "$(container_cmd)" pull ghcr.io/anweber/httpyac:latest
    fi

    exec_on_host "$(container_cmd)" run -it --rm --network=host -v $PWD/test/rest:/data:Z anweber/httpyac $test_files --all

export PROJECT_ROOT := `pwd`

# Starts the database
db-up:
    exec "$PROJECT_ROOT/scripts/database/db-up.sh" "$@"

# Stops the database
db-down:
    exec "$PROJECT_ROOT/scripts/database/db-down.sh" "$@"

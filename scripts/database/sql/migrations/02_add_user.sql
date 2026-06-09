CREATE TABLE IF NOT EXISTS "user" (
    "id"    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "username"  TEXT           NOT NULL UNIQUE,
    "password"  TEXT           NOT NULL
);

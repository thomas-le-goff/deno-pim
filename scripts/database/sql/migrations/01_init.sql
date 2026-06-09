CREATE TABLE IF NOT EXISTS "product" (
    "id"    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "ean"   TEXT           NOT NULL UNIQUE,
    "name"  TEXT           NOT NULL,
    "price" NUMERIC(10, 2) NOT NULL
);

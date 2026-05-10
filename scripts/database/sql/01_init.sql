--Initialisation d'une table product pour stocker des produits (EAN, nom, prix, etc.) pour un PIM (version minimal pour le moment)

IF EXISTS (SELECT name FROM sqlite_master WHERE type='table' AND name='product')
BEGIN
    EXIT;
END;

CREATE TABLE product IF NOT EXISTS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ean TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
);

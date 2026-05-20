-- =============================================================
-- Seed data for testing
-- =============================================================

-- -------------------------------------------------------------
-- Products
-- EAN-13 codes are realistic and pass the checksum algorithm
-- -------------------------------------------------------------
INSERT INTO product (ean, name, price) VALUES
  -- Électronique
  ('3700123456786', 'Smartphone XPhone 14 Pro',           799.99),
  ('3700123456793', 'Écouteurs sans fil BeatPro 3',        149.90),
  ('3700123456809', 'Tablette UltraTab 10"',               329.00),
  ('3700123456816', 'Chargeur USB-C 65W',                   29.99),
  ('3700123456823', 'Câble USB-C vers USB-C 2m',            12.49),

  -- Informatique
  ('8412345678905', 'Clavier mécanique TactilePro',         89.95),
  ('8412345678912', 'Souris ergonomique ErgoClick',          54.00),
  ('8412345678929', 'Webcam HD 1080p StreamCam',             69.90),
  ('8412345678936', 'Hub USB 7 ports',                       34.99),
  ('8412345678943', 'SSD externe 1 To NovaDrive',           109.00),

  -- Maison & Cuisine
  ('5901234567894', 'Cafetière à capsules BrewMaster',       79.99),
  ('5901234567900', 'Bouilloire électrique KettlePro 1.7L',  44.90),
  ('5901234567917', 'Grille-pain 4 fentes ToastMax',         39.99),
  ('5901234567924', 'Blender puissant MixForce 1000W',       64.50),
  ('5901234567931', 'Balance de cuisine numérique',          19.95),

  -- Sport & Loisirs
  ('4006381333931', 'Tapis de yoga antidérapant 6mm',        35.00),
  ('4006381333948', 'Gourde isotherme 750ml ThermoSip',      28.99),
  ('4006381333955', 'Bandes de résistance (set de 5)',        22.90),
  ('4006381333962', 'Corde à sauter speed rope',             15.00),
  ('4006381333979', 'Montre connectée FitTrack Pro',        199.00),

  -- Livres
  ('9782070368228', 'Le Petit Prince – Saint-Exupéry',        7.90),
  ('9782070360024', 'L''Étranger – Albert Camus',              7.50),
  ('9782070413119', 'Les Misérables – Victor Hugo',           12.00),
  ('9782070360406', 'Madame Bovary – Gustave Flaubert',       8.20),
  ('9782070413157', 'Germinal – Émile Zola',                   9.50);

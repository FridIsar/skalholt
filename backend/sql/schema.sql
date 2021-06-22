CREATE TABLE years (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  svg_uri VARCHAR(128)
);

CREATE TABLE buildings (
  id SERIAL PRIMARY KEY,
  path VARCHAR(8192),
  description VARCHAR(512),
  svg_uri VARCHAR(128)
);

CREATE TABLE building_attributions (
  building INTEGER,
  language VARCHAR(2) NOT NULL,
  attribution VARCHAR(64) NOT NULL,
  PRIMARY KEY (building, language),
  CONSTRAINT FK_buildingAttribution_building FOREIGN KEY (building) REFERENCES buildings (id) ON DELETE CASCADE
);

CREATE TABLE building_years (
  year INTEGER NOT NULL,
  building INTEGER NOT NULL,
  CONSTRAINT FK_buildingYears_year FOREIGN KEY (year) REFERENCES years (id) ON DELETE CASCADE,
  CONSTRAINT FK_buildingYears_building FOREIGN KEY (building) REFERENCES buildings (id) ON DELETE CASCADE
);

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  building INTEGER NOT NULL,
  CONSTRAINT FK_rooms_building FOREIGN KEY (building) REFERENCES buildings (id) ON DELETE CASCADE
);

CREATE TABLE finds (
  id SERIAL PRIMARY KEY,
  description VARCHAR(512),
  building INTEGER NOT NULL,
  CONSTRAINT FK_finds_building FOREIGN KEY (building) REFERENCES buildings (id) ON DELETE CASCADE
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(256) NOT NULL UNIQUE,
  email VARCHAR(256) NOT NULL UNIQUE,
  password VARCHAR(256) NOT NULL,
  admin BOOLEAN DEFAULT false
);
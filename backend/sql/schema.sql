CREATE TABLE years (
  year INTEGER PRIMARY KEY,
  image VARCHAR(128)
);

CREATE TABLE buildings (
  id SERIAL PRIMARY KEY,
  phase VARCHAR(8) NOT NULL UNIQUE,
  start_year SMALLINT NOT NULL,
  end_year SMALLINT NOT NULL,
  path VARCHAR(8192),
  description VARCHAR(4096),
  english VARCHAR(64),
  icelandic VARCHAR(64),
  image VARCHAR(128),
  CONSTRAINT FK_buildingYears_start FOREIGN KEY (start_year) REFERENCES years (year) ON DELETE CASCADE,
  CONSTRAINT FK_buildingYears_end FOREIGN KEY (end_year) REFERENCES years (year) ON DELETE CASCADE
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
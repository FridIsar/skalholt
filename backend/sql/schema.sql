CREATE TABLE year_periods (
  id SERIAL PRIMARY KEY,
  start_date INTEGER NOT NULL,
  end_date INTEGER NOT NULL,
  svg VARCHAR(256)
);

CREATE TABLE buildings (
  id SERIAL PRIMARY KEY,
  phase VARCHAR(128) NOT NULL,
  attribution VARCHAR(128),
  description VARCHAR(256)
);

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  "number" INTEGER NOT NULL,
  description VARCHAR(256),
  building_id INTEGER NOT NULL,
  CONSTRAINT FK_rooms_building FOREIGN KEY (building_id) REFERENCES buildings (id) ON DELETE CASCADE
);

CREATE TABLE finds (
  id SERIAL PRIMARY KEY,
  description VARCHAR(256),
  building_id INTEGER NOT NULL,
  CONSTRAINT FK_finds_building FOREIGN KEY (building_id) REFERENCES buildings (id) ON DELETE CASCADE
);

CREATE TABLE building_periods (
  building_id INTEGER NOT NULL,
  period INTEGER NOT NULL,
  CONSTRAINT FK_buildingPeriod_building FOREIGN KEY (building_id) REFERENCES buildings (id) ON DELETE CASCADE,
  CONSTRAINT FK_buildingPeriod_period FOREIGN KEY (period) REFERENCES year_periods (id) ON DELETE CASCADE
);

CREATE TABLE building_points (
  "number" INTEGER,
  building_id INTEGER,
  coords POINT NOT NULL,
  PRIMARY KEY ("number", building_id),
  CONSTRAINT FK_building_point FOREIGN KEY (building_id) REFERENCES buildings (id) ON DELETE CASCADE
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(256) NOT NULL UNIQUE,
  email VARCHAR(256) NOT NULL UNIQUE,
  password VARCHAR(256) NOT NULL,
  admin BOOLEAN DEFAULT false
);
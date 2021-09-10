-- Additional files for e.g. finds need to be added manually
-- Currently on pause since likely have too many actual groups
-- Discuss to see if this check is even possible ...
--
-- If it is f_group should be changed from VARCHAR to file_group
--
-- CREATE TYPE file_group AS ENUM (
--   'buildings',
--   'features',
--   'keys',
--   'pottery',
--   'writing',
--   'tiles'
-- );

CREATE TABLE logging (
  logging_id BOOLEAN PRIMARY KEY DEFAULT TRUE,
  curr_building_id INTEGER,
  curr_file_id INTEGER,
  CONSTRAINT logging_id CHECK (logging_id)
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(256) NOT NULL UNIQUE,
  email VARCHAR(256) NOT NULL UNIQUE,
  password VARCHAR(256) NOT NULL,
  admin BOOLEAN DEFAULT false
);

CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  tag VARCHAR(32) NOT NULL UNIQUE,
  f_group VARCHAR(32),
  major_group VARCHAR(32),
  href VARCHAR(64)
);

CREATE TABLE years (
  year INTEGER PRIMARY KEY,
  image VARCHAR(128),
  description VARCHAR(4096)
);

-- Current assumption is that buildings and features only use one file group
CREATE TABLE buildings (
  id SERIAL PRIMARY KEY,
  phase VARCHAR(32) NOT NULL UNIQUE,
  start_year SMALLINT,
  end_year SMALLINT,
  path VARCHAR(8192),
  description VARCHAR(4096),
  english VARCHAR(64),
  icelandic VARCHAR(64),
  image VARCHAR(128),
  CONSTRAINT FK_buildingYears_start FOREIGN KEY (start_year) REFERENCES years (year) ON DELETE CASCADE,
  CONSTRAINT FK_buildingYears_end FOREIGN KEY (end_year) REFERENCES years (year) ON DELETE CASCADE
);

CREATE TABLE features (
  id SERIAL PRIMARY KEY,
  type VARCHAR(32),
  description VARCHAR(128),
  building INTEGER NOT NULL,
  CONSTRAINT FK_features_building FOREIGN KEY (building) REFERENCES buildings (id) ON DELETE CASCADE
);

CREATE TABLE finds (
  id SERIAL PRIMARY KEY,
  obj_type VARCHAR(64),
  material_type VARCHAR(64),
  f_group VARCHAR(32),
  fragments SMALLINT,
  building INTEGER NOT NULL,
  CONSTRAINT FK_finds_building FOREIGN KEY (building) REFERENCES buildings (id) ON DELETE CASCADE
);

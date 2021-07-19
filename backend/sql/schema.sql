CREATE TABLE years (
  year INTEGER PRIMARY KEY,
  image VARCHAR(128),
  description VARCHAR(4096)
);

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
  CONSTRAINT FK_buildingYears_start FOREIGN KEY (start_year) REFERENCES years (year) ON DELETE SET NULL,
  CONSTRAINT FK_buildingYears_end FOREIGN KEY (end_year) REFERENCES years (year) ON DELETE SET NULL
);

CREATE TABLE finds_writing (
  id SERIAL PRIMARY KEY,
  find INTEGER,
  context INTEGER,
  quant SMALLINT,
  weight DECIMAL,
  obj_type VARCHAR(32),
  stone_type VARCHAR(64),
  group_no INTEGER,
  space INTEGER,
  area VARCHAR(16),
  unit_type VARCHAR(32),
  sieved SMALLINT,
  phase VARCHAR(32),
  building INTEGER,
  start_year INTEGER,
  end_year INTEGER,
  time_period VARCHAR(16),
  attribution VARCHAR(64),
  CONSTRAINT FK_writing_building FOREIGN KEY (building) REFERENCES buildings (id) ON DELETE SET NULL,
  CONSTRAINT FK_writing_start FOREIGN KEY (start_year) REFERENCES years (year) ON DELETE SET NULL,
  CONSTRAINT FK_writing_end FOREIGN KEY (end_year) REFERENCES years (year) ON DELETE SET NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(256) NOT NULL UNIQUE,
  email VARCHAR(256) NOT NULL UNIQUE,
  password VARCHAR(256) NOT NULL,
  admin BOOLEAN DEFAULT false
);
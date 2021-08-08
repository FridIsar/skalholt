CREATE TABLE logging (
  logging_id BOOLEAN PRIMARY KEY DEFAULT TRUE,
  curr_building_id INTEGER,
  curr_file_id INTEGER,
  CONSTRAINT logging_id CHECK (logging_id)
);

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

CREATE TABLE finds_keys (
  id SERIAL PRIMARY KEY,
  finds_no INTEGER,
  find_id INTEGER,
  context INTEGER,
  key_no INTEGER,
  find_date DATE,
  photo VARCHAR(1),
  completeness VARCHAR(16),
  material VARCHAR(32),
  condition VARCHAR(32),
  length DECIMAL,
  weight DECIMAL,
  bow VARCHAR(1),
  type VARCHAR(16),
  shape_bow VARCHAR(32),
  collar VARCHAR(1),
  size_bow DECIMAL,
  length_stem DECIMAL,
  stem VARCHAR(16),
  thickness_stem DECIMAL,
  bit_type VARCHAR(16),
  bit_tip VARCHAR(16),
  bit_teeth SMALLINT,
  bit_shape VARCHAR(16),
  id_1 INTEGER,
  notes VARCHAR(512),
  phase VARCHAR(32),
  building INTEGER,
  start_year INTEGER,
  end_year INTEGER,
  real_date VARCHAR(32),
  time_period VARCHAR(32),
  attribution VARCHAR(64),
  CONSTRAINT FK_keys_building FOREIGN KEY (building) REFERENCES buildings (id) ON DELETE SET NULL,
  CONSTRAINT FK_keys_start FOREIGN KEY (start_year) REFERENCES years (year) ON DELETE SET NULL,
  CONSTRAINT FK_keys_end FOREIGN KEY (end_year) REFERENCES years (year) ON DELETE SET NULL
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
  href VARCHAR(64)
);

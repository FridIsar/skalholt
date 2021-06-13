-- Test admin account
-- Password needs to be adjusted according to bcrypt cycles

INSERT INTO
  users (username, email, password, admin)
VALUES
  ('admin', 'bla@bla.bla', '123', true);
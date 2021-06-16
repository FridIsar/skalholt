-- Test admin account
-- Password needs to be adjusted according to bcrypt cycles
-- Password is 1234567890

INSERT INTO
  users (username, email, password, admin)
VALUES
  ('admin', 'bla@bla.bla', '$2b$12$BB1tJYM6EUAaQr1YhslmHOKJkuQrBAxiPqw66pC.PsCtm/pte6uBi', true);
import bcrypt from 'bcrypt';
import xss from 'xss';
import dotenv from 'dotenv';

import { conditionalUpdate, query } from '../db.js';
import { isString, isInt } from '../utils/typeChecking.js';
import { logger } from '../utils/logger.js';

dotenv.config();
// Default to 12 instead of forcing env

const {
  BCRYPT_ROUNDS: bcryptRounds = 12,
} = process.env;

export async function createUser(username, email, password) {
  const hashedPassword = await bcrypt.hash(password, parseInt(bcryptRounds, 10));

  const q = `
    INSERT INTO
      users (username, email, password)
    VALUES
      ($1, $2, $3)
    RETURNING *`;

  const values = [xss(username), xss(email), hashedPassword];
  const result = await query(
    q,
    values,
  );

  return result.rows[0];
}

export async function comparePasswords(password, hash) {
  const result = await bcrypt.compare(password, hash);

  return result;
}

export async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  try {
    const result = await query(q, [username]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (err) {
    logger.error('Unable to find user by username', username);
    console.error(err);
    return null;
  }

  return false;
}

export async function findByEmail(email) {
  const q = 'SELECT * FROM users WHERE email = $1';

  try {
    const result = await query(q, [email]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (err) {
    logger.error('Unable to find user by email', email);
    console.error(err);
    return null;
  }

  return false;
}

export async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';

  try {
    const result = await query(q, [id]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (err) {
    logger.error('Unable to find user by id', id);
    console.error(err);
  }

  return null;
}

export async function updateUser(id, password, email) {
  if (!isInt(id)) {
    return null;
  }

  const fields = [
    isString(password) ? 'password' : null,
    isString(email) ? 'email' : null,
  ];

  let hashedPassword = null;

  if (password) {
    hashedPassword = await bcrypt.hash(password, parseInt(bcryptRounds, 10));
  }

  const values = [
    hashedPassword,
    isString(email) ? xss(email) : null,
  ];

  const result = await conditionalUpdate('users', id, fields, values);

  if (!result) {
    return null;
  }

  const updatedUser = result.rows[0];
  delete updatedUser.password;

  return updatedUser;
}

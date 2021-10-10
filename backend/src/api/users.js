import { query, singleQuery } from '../db.js';
import { logger } from '../utils/logger.js';

/**
 * Helper function to display the information
 * of the user with the given ID
 *
 * NOTE:
 * * Password is not shown
 *
 * @param {number} userId the ID of the user to show
 * @returns the info of the user if the user exists
 */
export async function listUser(userId) {
  const user = await singleQuery(
    `SELECT
      id, username, email, admin
    FROM
      users
    WHERE
      id = $1`,
    [userId],
  );

  if (!user) {
    return null;
  }

  return user;
}

/**
 * Routing function used for GET on /users,
 * returns a list of users
 *
 * NOTE:
 * * Somewhat obviously the password is always omitted
 *
 * @param {Object} _req request object ( Not used )
 * @param {Object} res  response object
 * @returns JSON response with the rows of the existing users
 */
export async function listUsers(_req, res) {
  const users = await query(
    `SELECT
      id, username, email, admin
    FROM
      users
    ORDER BY id ASC`,
  );

  if (!users) {
    return null;
  }

  return res.json(users.rows);
}

/**
 * Routing function used for PATCH on /users/{id}, this is generally
 * just used to update newly registered users to admin if there is ever
 * a desire to allow someone else to spellcheck the info on the site
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the update
 */
export async function updateUser(req, res) {
  const { admin } = req.body;
  const userId = req.params.id;

  try {
    const updatedUser = await singleQuery(
      `UPDATE
        users
      SET
        admin = $1
      WHERE
        id = $2
      RETURNING
        id, username, email, admin`,
      [admin, userId],
    );

    return res.status(200).json(updatedUser);
  } catch (err) {
    logger.error('Unable to update user', err);
  }

  return res.status(500).json(null);
}

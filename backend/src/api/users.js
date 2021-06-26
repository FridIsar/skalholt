import { singleQuery } from '../db.js';
import { logger } from '../utils/logger.js';

export async function listUser(userId) {
  const user = await singleQuery(
    `
      SELECT
        id, username, email, admin
      FROM
        users
      WHERE
        id = $1
    `,
    [userId],
  );

  if (!user) {
    return null;
  }

  return user;
}

export async function listUsers(_req, res) {
  const users = await singleQuery(
    `
      SELECT
        id, username, email, admin
      FROM
        users
      ORDER BY id ASC
    `,
  );

  if (!users) {
    return null;
  }

  return res.json(users);
}

export async function updateUser(req, res) {
  const { admin } = req.body;
  const userId = req.params.id;

  try {
    const updatedUser = await singleQuery(
      `
        UPDATE
          users
        SET
          admin = $1,
        WHERE
          id = $2
        RETURNING
          id, username, email, admin
      `,
      [admin, userId],
    );
    return res.status(200).json(updatedUser);
  } catch (err) {
    logger.error('Unable to update user', err);
  }

  return res.status(500).json(null);
}

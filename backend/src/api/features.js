import { logger } from '../utils/logger.js';
import {
  query,
} from '../db.js';

export async function listFeatures(req, res) {
  const { buildingId: building } = req.params;

  const features = await query(
    `SELECT
      id,
      type,
      description
    FROM
      features
    WHERE
      building = $1`,
    [building],
  );

  if (features && features.rows[0]) {
    return res.json(features.rows);
  }

  return res.status(404).json(null);
}

export async function summarizeFeatures(building) {
  let features = [];

  try {
    const result = await query(
      `SELECT
        type,
        count(id) AS units
      FROM
        features
      WHERE
        building = $1
      GROUP BY
        type
      ORDER BY
        type ASC`,
      [building],
    );

    if (result.rows && result.rows.length > 0) {
      features = result.rows;
    }
  } catch (err) {
    logger.warn('Unable to query summarized features for building', building, err);
  }

  return features;
}

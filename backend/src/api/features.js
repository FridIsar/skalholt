import { logger } from '../utils/logger.js';
import {
  query,
} from '../db.js';

export async function listFeatures(building) {
  let features = [];

  try {
    const result = await query(
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

    if (result.rows && result.rows.length > 0) {
      features = result.rows;
    }
  } catch (err) {
    logger.warn('Unable to query features for building', building, err);
  }

  return features;
}

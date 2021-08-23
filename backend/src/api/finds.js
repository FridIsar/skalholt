import { logger } from '../utils/logger.js';
import {
  query,
} from '../db.js';

export async function listFinds(building) {
  let finds = [];

  try {
    const result = await query(
      `SELECT
        id,
        f_group AS group,
        obj_type,
        material_type,
        quantity
      FROM
        finds
      WHERE
        building = $1
      ORDER BY
        f_group ASC`,
      [building],
    );

    if (result.rows && result.rows.length > 0) {
      finds = result.rows;
    }
  } catch (err) {
    logger.warn('Unable to query finds for building', building, err);
  }

  return finds;
}

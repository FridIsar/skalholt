import { logger } from '../utils/logger.js';
import {
  query,
} from '../db.js';

export async function listFinds(req, res) {
  const { buildingId: building } = req.params;

  const finds = await query(
    `SELECT
      id,
      f_group AS group,
      obj_type,
      material_type,
      fragments
    FROM
      finds
    WHERE
      building = $1
    ORDER BY
      f_group ASC`,
    [building],
  );

  if (finds && finds.rows[0]) {
    return res.json(finds.rows);
  }

  return res.status(404).json(null);
}

export async function summarizeFinds(building) {
  let finds = [];

  try {
    const result = await query(
      `SELECT
        f_group AS group,
        SUM(fragments) AS fragments
      FROM
        finds
      WHERE
        building = $1
      GROUP BY
        f_group
      ORDER BY
        f_group ASC`,
      [building],
    );

    if (result.rows && result.rows.length > 0) {
      finds = result.rows;
    }
  } catch (err) {
    logger.warn('Unable to query summarized finds for building', building, err);
  }

  return finds;
}

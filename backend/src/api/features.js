import xss from 'xss';
import { logger } from '../utils/logger.js';
import {
  query,
  deleteQuery,
  conditionalUpdate,
} from '../db.js';

import { isString } from '../utils/typeChecking.js';

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

export async function createFeature(req, res) {
  const { buildingId: id } = req.params;
}

export async function updateFeature(req, res) {
  const { featureId: id } = req.params;
  const { body } = req;

  const fields = [
    isString(body.type) ? 'type' : null,
    isString(body.description) ? 'description' : null,
  ];

  const values = [
    isString(body.type) ? xss(body.type) : null,
    isString(body.description) ? xss(body.description) : null,
  ];

  const result = await conditionalUpdate('features', 'id', id, fields, values);

  if (!result || !result.rows[0]) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  return res.status(200).json(result.rows[0]);
}

export async function deleteFeature(req, res) {
  const { featureId } = req.params;

  try {
    const deleted = await deleteQuery(
      'DELETE FROM features WHERE id = $1',
      [featureId],
    );

    if (deleted === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (err) {
    logger.error(`Unable to delete feature ${featureId}`, err);
  }

  return res.status(500).json(null);
}

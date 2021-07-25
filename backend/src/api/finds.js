// TODO Notes:
// It would make more sense to only store one level of detail in the database
// Currently additional storage is forcing two additional select statements
// If we only show one level of detail and give out the csv for more detail
// Storing the addition values is unnecessary and is only slowing down
// The building route.
//
// Similarly having three different tables for finds if we only use
// two variables from each that could effectively be standardized
// .e.g. type, is making it necessary to write three (or more) distinct
// POST, PATCH and DELETE routes to edit these finds

import { logger } from '../utils/logger.js';
import {
  query,
} from '../db.js';

export async function writingFinds(building) {
  let finds = [];

  try {
    const result = await query(
      `SELECT
        finds_writing.id,
        finds_writing.quant,
        finds_writing.obj_type,
        finds_writing.weight
      FROM
        finds_writing
      WHERE
        finds_writing.building = $1`,
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

export async function keyFinds(building) {
  let finds = [];

  try {
    const result = await query(
      `SELECT
        finds_keys.id,
        finds_keys.type AS obj_type,
        finds_keys.weight
      FROM
        finds_keys
      WHERE
        finds_keys.building = $1`,
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

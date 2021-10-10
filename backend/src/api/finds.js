import xss from 'xss';
import { logger } from '../utils/logger.js';
import {
  query,
  deleteQuery,
  conditionalUpdate,
  insertFind,
} from '../db.js';

import { isString, isInt } from '../utils/typeChecking.js';

/**
 * Routing function used for GET on /years/{year}/buildings/{building}/finds,
 * returns a list of finds with their basic information
 *
 * NOTE:
 * * Currently finds work relationally with buildings,
 * because of this you only receive a list of finds for the selected building
 *
 * @param {Object} _req request object ( Not used )
 * @param {Object} res  response object
 * @returns JSON response with the rows of the available finds
 */
export async function listFinds(req, res) {
  const { buildingId: building } = req.params;

  const finds = await query(
    `SELECT
      id,
      f_group,
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

/**
 * Helper function used to group finds and provide a summary
 * for a given building using the building ID
 *
 * @param {number} building the building ID to fetch for
 * @returns a list of grouped and summarized finds info
 */
export async function summarizeFinds(building) {
  let finds = [];

  try {
    const result = await query(
      `SELECT
        f_group,
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

/**
 * Routing function used for POST on /years/{year}/buildings/{building}/finds,
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the insert
 */
export async function createFind(req, res) {
  const { buildingId: id } = req.params;
  const {
    obj_type: objectType,
    material_type: materialType,
    file_group: fileGroup,
    fragments,
  } = req.body;

  const insertFindResult = await insertFind({
    id,
    objectType,
    materialType,
    fileGroup,
    fragments,
  });

  if (insertFindResult) {
    return res.status(201).json(insertFindResult);
  }

  return res.status(500).end();
}

/**
 * Routing function used for PATCH on /years/{year}/buildings/{building}/finds,
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the update
 */
export async function updateFind(req, res) {
  const { findId: id } = req.params;
  const { body } = req;

  const fields = [
    isString(body.obj_type) ? 'obj_type' : null,
    isString(body.material_type) ? 'material_type' : null,
    isString(body.file_group) ? 'file_group' : null,
    isInt(body.fragments) ? 'fragments' : null,
  ];

  const values = [
    isString(body.obj_type) ? xss(body.obj_type) : null,
    isString(body.material_type) ? xss(body.material_type) : null,
    isString(body.file_group) ? xss(body.file_group) : null,
    isInt(body.fragments) ? xss(body.fragments) : null,
  ];

  const result = await conditionalUpdate('finds', 'id', id, fields, values);

  if (!result || !result.rows[0]) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  return res.status(200).json(result.rows[0]);
}

export async function deleteFind(req, res) {
  const { findId } = req.params;

  try {
    const deleted = await deleteQuery(
      'DELETE FROM finds WHERE id = $1',
      [findId],
    );

    if (deleted === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (err) {
    logger.error(`Unable to delete find ${findId}`, err);
  }

  return res.status(500).json(null);
}

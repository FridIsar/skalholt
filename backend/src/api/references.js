import xss from 'xss';
import { logger } from '../utils/logger.js';
import {
  query,
  deleteQuery,
  conditionalUpdate,
  insertReference,
} from '../db.js';

import { isString } from '../utils/typeChecking.js';

/**
 * Routing function used for GET on /references
 * returns a list of references
 *
 * @param {Object} _req request object ( Not used )
 * @param {Object} res  response object
 * @returns JSON response with the rows of the available finds
 */
export async function listReferences(req, res) {
  const references = await query(
    `SELECT
      *
    FROM
      refs
    ORDER BY
      reference ASC`,
    [],
  );

  if (references && references.rows[0]) {
    return res.json(references.rows);
  }

  return res.status(404).json(null);
}

/**
 * Routing function used for POST on /references/
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the insert
 */
export async function createReference(req, res) {
  const {
    reference,
    description,
    doi,
  } = req.body;

  const insertReferenceResult = await insertReference({
    reference,
    description,
    doi,
  });

  if (insertReferenceResult) {
    return res.status(201).json(insertReferenceResult);
  }

  return res.status(500).end();
}

/**
 * Routing function used for PATCH on /references/{referenceId}
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the update
 */
export async function updateReference(req, res) {
  const { referenceId: id } = req.params;
  const { body } = req;

  const fields = [
    isString(body.reference) ? 'reference' : null,
    isString(body.description) ? 'description' : null,
    isString(body.doi) ? 'doi' : null,
  ];

  const values = [
    isString(body.reference) ? xss(body.reference) : null,
    isString(body.description) ? xss(body.description) : null,
    isString(body.doi) ? xss(body.doi) : null,
  ];

  const result = await conditionalUpdate('refs', 'id', id, fields, values);

  if (!result || !result.rows[0]) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  return res.status(200).json(result.rows[0]);
}

export async function deleteReference(req, res) {
  const { referenceId } = req.params;

  try {
    const deleted = await deleteQuery(
      'DELETE FROM refs WHERE id = $1',
      [referenceId],
    );

    if (deleted === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (err) {
    logger.error(`Unable to delete reference ${referenceId}`, err);
  }

  return res.status(500).json(null);
}

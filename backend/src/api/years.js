import {
  query,
  singleQuery,
  // deleteQuery,
  // conditionalUpdate
} from '../db.js';

export async function listYears(_req, res) {
  const years = await query(
    `SELECT
      id, year
    FROM
      years
    ORDER BY year ASC`,
    [],
  );

  return res.json(years.rows);
}

export async function listYear(req, res) {
  const { yearId: id } = req.params;

  const year = await singleQuery(
    `SELECT
      id,
      year,
      svg_uri
    FROM
      years
    WHERE
      id = $1`,
    [id],
  );

  if (!year) {
    return null;
  }

  return res.json(year);
}

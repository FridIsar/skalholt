import {
  query,
  singleQuery,
  // deleteQuery,
  // conditionalUpdate
} from '../db.js';

export async function listBuildings(req, res) {
  const { yearId: id } = req.params;

  const buildings = await query(
    `SELECT
      id, path, start_year AS start, end_year AS end, english AS en, icelandic AS is
    FROM
      buildings
    WHERE
      $1 >= start_year AND $1 < end_year;`,
    [id],
  );

  return res.json(buildings.rows);
}

export async function listBuilding(req, res) {
  const { yearId, buildingId: buildingNumber } = req.params;

  if (!buildingNumber) {
    return null;
  }

  const building = await singleQuery(
    `SELECT
      id, description, english AS en, icelandic AS is, image
    FROM
      buildings
    WHERE
      id = $1
    AND
      $2 >= start_year AND $2 < end_year;`,
    [buildingNumber, yearId],
  );

  if (!building) {
    return null;
  }

  return res.json(building);
}

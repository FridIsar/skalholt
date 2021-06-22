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
      id, path, english AS en, icelandic AS is
    FROM
      buildings
    WHERE
      id IN (
        SELECT
          building_years.building
        FROM
          building_years
        WHERE
          building_years.year = $1
      )`,
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
      id, description, english AS en, icelandic AS is, svg_uri
    FROM
      buildings
    WHERE
      id = $1
    AND
      id IN (
        SELECT
          building_years.building
        FROM
          building_years
        WHERE
          building_years.year = $2
      )
    `,
    [buildingNumber, yearId],
  );

  if (!building) {
    return null;
  }

  return res.json(building);
}

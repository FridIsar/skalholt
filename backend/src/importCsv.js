/* eslint-disable no-await-in-loop */
import csv from 'csv-parser';
import fs from 'fs';

import { query, singleQuery } from './db.js';

const YEARS_SVG_ROUTE = '/years/';

function getData(file) {
  const data = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(csv())
      .on('error', (error) => {
        reject(error);
      })
      .on('data', (item) => data.push(item))
      .on('end', () => {
        resolve(data);
      });
  });
}

async function importYear(year) {
  const q = `
    INSERT INTO
      years
      (year, svg_uri)
    VALUES
      ($1, $2)`;

  const values = [
    year.year,
    (YEARS_SVG_ROUTE + year.svg) || null,
  ];

  await query(q, values);
}

async function importBuildingYear(year, building) {
  const yearId = await singleQuery(
    'SELECT id FROM years WHERE year = $1', [year],
  );

  const q = `
    INSERT INTO
      building_years
      (year, building)
    VALUES
      ($1, $2)`;

  const values = [yearId.id, building];

  query(q, values);
}

async function importBuildingYears(start, end, id) {
  const startDate = parseInt(start, 10);
  const endDate = parseInt(end, 10);

  for (let i = startDate; i < endDate; i += 10) {
    await importBuildingYear(i, id);
  }
}

async function importBuilding(building) {
  const getLast = await singleQuery(
    'SELECT max(id) FROM buildings',
  );

  const lastBuilding = getLast.max;

  const currentBuilding = lastBuilding ? lastBuilding + 1 : 1;

  const q = `
    INSERT INTO
      buildings
      (path, description, english, icelandic, svg_uri)
    VALUES
      ($1, $2, $3, $4, $5)`;

  const svgRoute = `${YEARS_SVG_ROUTE}${building.start}/buildings/${currentBuilding}.svg`;

  const values = [
    building.path || null,
    building.description || null,
    building.en || null,
    building.is || null,
    svgRoute,
  ];

  await query(q, values);
  await importBuildingYears(building.start, building.end, currentBuilding);
}

export async function importData() {
  // Years
  const years = await getData('./data/csv/years.csv');

  console.info('Importing years');
  for (let i = 0; i < years.length; i += 1) {
    await importYear(years[i]);
    console.info(years[i].year);
  }

  // Buildings
  const buildings = await getData('./data/csv/buildings.csv');

  console.info('Importing buildings');
  for (let i = 0; i < buildings.length; i += 1) {
    await importBuilding(buildings[i]);
    console.info(buildings[i].en);
  }

  // TODO: Rooms, Finds
}

/* eslint-disable no-await-in-loop */
import csv from 'csv-parser';
import fs from 'fs';

import { query } from './db.js';

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
  const yearId = await query(
    'SELECT id FROM years WHERE year = $1', [year],
  );

  const q = `
    INSERT INTO
      building_years
      (year, building)
    VALUES
      ($1, $2)`;

  const values = [yearId.rows[0].id, building];

  query(q, values);
}

async function importBuildingYears(start, end, id) {
  const startDate = parseInt(start, 10);
  const endDate = parseInt(end, 10);

  for (let i = startDate; i < endDate; i += 10) {
    await importBuildingYear(i, id);
  }
}

async function importBuildingAttribution(lang, attribution, id) {
  const q = `
  INSERT INTO
    building_attributions
    (building, language, attribution)
  VALUES
    ($1, $2, $3)`;

  const values = [
    id,
    lang,
    attribution,
  ];

  query(q, values);
}

async function importBuildingAttributions(building, currentBuilding) {
  if (building.en) await importBuildingAttribution('en', building.en, currentBuilding);
  if (building.is) await importBuildingAttribution('is', building.is, currentBuilding);
}

async function importBuilding(building) {
  const getLast = await query(
    'SELECT max(id) FROM buildings',
  );

  const lastBuilding = getLast.rows[0].max;

  const currentBuilding = lastBuilding ? lastBuilding + 1 : 1;

  const q = `
    INSERT INTO
      buildings
      (path, description, svg_uri)
    VALUES
      ($1, $2, $3)`;

  const svgRoute = `${YEARS_SVG_ROUTE}${building.start}/buildings/${currentBuilding}.svg`;

  const values = [
    building.path || null,
    building.description || null,
    svgRoute,
  ];

  await query(q, values);
  await importBuildingYears(building.start, building.end, currentBuilding);
  await importBuildingAttributions(building, currentBuilding);
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

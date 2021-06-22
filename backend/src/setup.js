import dotenv from 'dotenv';

import { importData } from './importCsv.js';
import { readFile } from './utils/fileSystem.js';
import { query } from './db.js';
import requireEnv from './utils/requireEnv.js';

dotenv.config();
requireEnv(['DATABASE_URL']);

async function main() {
  try {
    const dropTables = await readFile('./sql/drop.sql');
    await query(dropTables);
    console.info('Existing tables dropped');
  } catch (err) {
    console.error('Error while dropping tables:', err.message);
    return;
  }

  try {
    const createTables = await readFile('./sql/schema.sql');
    await query(createTables);
    console.info('Database tables created');
  } catch (err) {
    console.error('Error while creating tables:', err.message);
    return;
  }

  try {
    const createData = await readFile('./sql/dummy.sql');
    await query(createData);
    console.info('Dummy user created');
  } catch (err) {
    console.error('Error creating dummy user:', err.message);
    return;
  }

  try {
    await importData();
  } catch (err) {
    console.error('Error importing csv data:', err.message);
  }
}

main().catch((err) => {
  console.error(err);
});

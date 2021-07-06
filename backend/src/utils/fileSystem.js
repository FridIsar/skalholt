import {
  access,
  mkdir,
  writeFile as fsWriteFile,
  readFile as fsReadFile,
  stat as fsStat,
  readdir as fsReadDir,
} from 'fs/promises'; // eslint-disable-line import/no-unresolved
import fs from 'fs';
import csv from 'csv-parser';

export async function stat(file) {
  let result = null;
  try {
    result = await fsStat(file);
  } catch (e) {
    // unused
  }
  return result;
}

export async function exists(file) {
  let ok = true;
  try {
    await access(file, fs.constants.F_OK);
  } catch (e) {
    ok = false;
  }
  return ok;
}

export async function isReadable(dir) {
  let readable = true;
  try {
    await access(dir, fs.constants.R_OK);
  } catch (e) {
    readable = false;
  }

  return readable;
}

export async function readFile(file, encoding = 'utf8') {
  if (!(await isReadable(file))) {
    return null;
  }

  const content = await fsReadFile(file);

  if (!encoding) {
    return content;
  }

  return content.toString(encoding);
}

export async function deleteFiles(files) {
  for (const file of files) {
    fs.unlink((file), (err) => {
      if (err) throw err;
    });
  }
}

export async function createDir(dir) {
  await mkdir(dir, { recursive: true });
}

export async function writeFile(
  file,
  data,
  encoding = 'utf8',
) {
  return fsWriteFile(file, data, { encoding });
}

export async function isWriteable(dir) {
  let writeable = true;
  try {
    await access(dir, fs.constants.W_OK);
  } catch (e) {
    writeable = false;
  }

  return writeable;
}

export async function prepareDir(dir) {
  if (!(await exists(dir))) {
    await createDir(dir);
  }
  return isWriteable(dir);
}

export async function readDir(dir) {
  let results = [];
  try {
    results = await fsReadDir(dir);
  } catch {
    // unused
  }
  return results;
}

export async function removeDir(dir) {
  fs.rm(dir, { recursive: true }, (err) => {
    console.error(err);
  });
}

export async function readStream(file) {
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

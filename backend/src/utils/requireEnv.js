import { isEmpty } from './typeChecking.js';

export default function requireEnv(vars = []) {
  const missing = [];

  vars.forEach((v) => {
    if (!process.env[v] || isEmpty(process.env[v])) {
      missing.push(v);
    }
  });

  if (missing.length > 0) {
    console.error(`${missing.join(', ')} is missing from .env`);
    process.exit(1);
  }
}

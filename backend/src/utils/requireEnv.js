import { isEmpty } from './typeChecking.js';

/**
 * Helper function to check whether all required environment
 * variables are present
 *
 * @param {Object} vars an array of variables that need to be
 *                      present in .env
 */
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

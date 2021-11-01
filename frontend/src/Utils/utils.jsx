
/**
 * combines given strings with one '/' if more than one '/' would be if combined then one removed.
 * @param  {...any} urls strings that combined by '/' are a URL
 * @returns combined string from given url's
 */
export function joinUrls(...urls) {
  let finalUrl = '';
  for (let i = 0; i < urls.length; i++) {
    let currUrl = urls[i];
    if (currUrl?.slice(-1) !== '/') {
      currUrl = currUrl + '/';
    }
    if (currUrl?.slice(0,1) === '/') {
      currUrl = currUrl?.substring(1);
    }
    finalUrl = finalUrl + currUrl;
  }
  return finalUrl;
}

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
  console.log(urls)
  console.log(finalUrl)
  return finalUrl;
}
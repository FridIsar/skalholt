
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


export function beautify(text) {
  // uppercase first letter
  let firstChar = text.charAt(0);
  let upperFirstLetter = firstChar.toUpperCase();
  //replace _ with whitespace
  let checkSplit = text.split("_");
  let combinedText = '';
  if(checkSplit.length > 1) {
    for (var i = 0; i < checkSplit.length; i++) {
      if (i > 0) {
        combinedText = combinedText + ' ' + checkSplit[i];
      } else {
        combinedText = checkSplit[i];
      }
    }
  } else {
    combinedText = checkSplit[0];
  }

  // final string
  const final = upperFirstLetter + combinedText.slice(1);
  return final;
}
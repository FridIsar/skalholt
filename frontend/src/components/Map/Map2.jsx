import s from './map.module.scss';

import { VectorMap } from '@south-paw/react-vector-maps';


const apiUrl = process.env.REACT_APP_API_URL;

function makeMapJson(data) {
  if (data?.finds) {
    //TODO: when finds is finalised in backend
    let layers = [];
    const viewBox = "0 0 111.985 71.657"; // unknown using previous for now
    let finds = data.finds;
    for(let i = 0; i < finds?.length; i++) {
      for(let j = 0; j < finds[i]; j++) {
        layers[i]['id'] = finds[i]['id'];
        layers[i]['name'] = finds[i]['id'];
        layers[i]['d'] = finds[i]['path']; // unknown
        // can change if backend changes
      }
    }
    const JSONmap = {"id":"map", "name":"map", "viewBox":viewBox, "layers":layers};
    return JSONmap;
  } else {
    const viewBox = "0 0 111.985 71.657";
    for(let i = 0; i < data.length; i++) {
      data[i]['name'] = data[i]['id'];
    }
    const JSONmap = {"id":"map", "name":"map", "viewBox":viewBox, "layers":data};
    return JSONmap;
  }
}

function joinUrls(...urls) {
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

export function Map2({ data, background, current, setCurrent, setOnClick, loading, error }) {

  const layerProps = {
    onClick: ({ target }) => setOnClick(target.attributes.id.value),
    onMouseEnter: ({ target }) => setCurrent(target.attributes.id.value),
    onMouseLeave: ({ target }) => setCurrent('None'),
  };

  if (error) {
    return (
      <p className={s.news__error}>Error: {error}</p>
    );
  }

  if (loading) {
    return (
      <p className={s.news__loading}>Loading...</p>
    );
  }

  return (
    <div className={s.mapContainer}>
      <div className={s.map}>
      {background &&
        <img alt='map details' src={joinUrls(apiUrl, background)} className={s.image}/>
      }
      {!background &&
        <img alt='map details' src={joinUrls(apiUrl, data.image)} className={s.image}/>
      }
        <div>
          <VectorMap {...makeMapJson(data)} layerProps={layerProps} currentLayers={[parseInt(current)]} />
        </div>
      </div>
    </div>
  )
}
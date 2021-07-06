import s from './map.module.scss';

import { VectorMap } from '@south-paw/react-vector-maps';
import React, { useEffect, useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;

function makeJSON(buildings) {
  const viewBox = "0 0 841.89 595.28";
  //changing path to d
  for(let i = 0; i < buildings.length; i++) {
    buildings[i]['d'] = buildings[i]['path'];
    delete buildings[i]['path'];
  }
  const JSONmap = {"id":"map", "name":"map", "viewBox":viewBox, "layers":buildings};
  return JSONmap;
}

export function Map({ year }) {
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [json, setJson] = useState(null);

  const layerProps = {
    onMouseEnter: ({ target }) => setCurrent(target.attributes.en.value),
    onMouseLeave: ({ target }) => setCurrent('None'),
  };

  useEffect(() => {
    async function fetchBuildings() {
      setLoading(true);
      setError(null);

      let json;
      const url = apiUrl+"years/"+year+"/buildings/";
      try {
        const result = await fetch(url);
        if (!result.ok) {
          throw new Error('result not ok');
        }
        json = await result.json();
      } catch (e) {
        setError('Cannot get buildings.');
        return;
      } finally {
        setLoading(false);
      }

      const JSONmap = makeJSON(json);
      setJson(JSONmap);
    }
    fetchBuildings();
  }, [year]);

  if (error) {
    return (
      <p className={s.news__error}>Villa kom upp: {error}</p>
    );
  }

  if (loading) {
    return (
      <p className={s.news__loading}>Sæki gögn...</p>
    );
  }

  return (

    <div className={s.mapContainer}>
      <div className={s.map}>
        <div>
          <VectorMap {...json} layerProps={layerProps} currentLayers={[current]} />
        </div>
      </div>
      <img alt='map details' src={apiUrl+"years/"+year+".svg"} className={s.image}/>
    </div>

  )
}
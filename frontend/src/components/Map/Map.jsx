import s from './map.module.scss';

import { VectorMap } from '@south-paw/react-vector-maps';
import React, { useEffect, useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;

function makeJSON(buildings) {
  const viewBox = '0 0 612.70581 419.48148';

  const JSONmap = {"id":"map", "name":"map", "viewBox":viewBox, "layers":buildings};

  console.log(JSONmap);

  return JSONmap;
}

export function Map({ year = -1 }) {
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [json, setJson] = useState(null);

  const layerProps = {
    onMouseEnter: ({ target }) => setCurrent(target.attributes.name.value.toLowerCase()),
    onMouseLeave: ({ target }) => setCurrent('None'),
  };

  function onEnter(event) {
    const object = event.target.innerText.toLowerCase();
    setCurrent(object);
    console.log("object");
  }

  function onLeave(event) {
    setCurrent(null);
    console.log("leave");
  }

  useEffect(() => {
    async function fetchBuildings() {
      console.log("in fetchbuildings")
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
        <img alt='map details' src='https://notendur.hi.is/hkh32/skalholtTMP/1670%20map.svg' className={s.image}/>
      </div>
  )
}
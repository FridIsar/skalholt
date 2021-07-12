import s from './map.module.scss';

import { VectorMap } from '@south-paw/react-vector-maps';
import React, { useEffect, useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;

// make Json file from given list of Json files
function makeJSON(layers) {
  const viewBox = "0 0 841.89 595.28";
  for(let i = 0; i < layers.length; i++) {
    layers[i]['name'] = layers[i]['id'];
  }
  const JSONmap = {"id":"map", "name":"map", "viewBox":viewBox, "layers":layers};
  return JSONmap;
}

export function Map({ year, buildingId, setBuildingId, current, setCurrent, setLayers, oneBuilding }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [json, setJson] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);

  const layerProps = {
    // onFocus: ({ target }) => console.log(target.attributes.id.value), //setCurrent(target.attributes.name.value), //
    onClick: ({ target }) => setBuildingId(target.attributes.id.value),
    // onClick: ({ target }) => console.log(target.attributes.name.value),
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

      // bList = buildingList
      let bList = [];
      for(let i = 0; i < JSONmap.layers.length; i++) {
        bList.push({"id": JSONmap.layers[i].id, "engName": JSONmap.layers[i].en, "islName": JSONmap.layers[i].is})
      }
      setLayers(bList);
      setImgUrl(apiUrl+"years/"+year+".svg")
    }

    async function fetchArtifacts() {
      setLoading(true);
      setError(null);

      let json;
      const url = apiUrl+"years/"+year+"/buildings/"+buildingId+"/artifacts?";  // may change just a guess
      try {
        const result = await fetch(url);
        if (!result.ok) {
          throw new Error('result not ok');
        }
        json = await result.json();
      } catch (e) {
        setError('Cannot get building.');
        return;
      } finally {
        setLoading(false);
      }

      const JSONmap = makeJSON(json);
      setJson(JSONmap);

      // aList = artifactList
      let aList = [];
      for(let i = 0; i < JSONmap.layers.length; i++) {
        aList.push({"id": JSONmap.layers[i].id, "engName": JSONmap.layers[i].en, "islName": JSONmap.layers[i].is}) // not sure what info is needed
      }
      setLayers(aList);
      setImgUrl(apiUrl+"years/"+year+"/buildings/"+buildingId+".svg")
    }

    {!oneBuilding && fetchBuildings()}
    // {oneBuilding && fetchArtifacts()}
  }, [year, buildingId]);

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
      <img alt='map details' src={imgUrl} className={s.image}/>
    </div>

  )
}
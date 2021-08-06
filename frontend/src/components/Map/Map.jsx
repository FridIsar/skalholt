import s from './map.module.scss';

import { VectorMap } from '@south-paw/react-vector-maps';
import React, { useEffect, useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;

// make Json file from given list of Json files
function makeJSON(json, oneBuilding) {
  if (!oneBuilding) {
    const viewBox = "0 0 111.985 71.657";
    for(let i = 0; i < json.length; i++) {
      json[i]['name'] = json[i]['id'];
    }
    const JSONmap = {"id":"map", "name":"map", "viewBox":viewBox, "layers":json};
    return JSONmap;
  }
  let layers = [];
  const viewBox = "0 0 111.985 71.657"; // unknown using previous for now
  for(let i = 0; i < json.finds.length; i++) {
    for(let j = 0; j < json.finds[i]; j++) {
      layers[i]['id'] = json.finds[i]['id'];
      layers[i]['name'] = json.finds[i]['id'];
      layers[i]['d'] = json.finds[i]['path']; // unknown
      // can change if backend changes
    }
  }
  const JSONmap = {"id":"map", "name":"map", "viewBox":viewBox, "layers":layers};
  return JSONmap;
}

export function Map({ year, buildingId, setBuildingId, current, setCurrent, setSidebar, oneBuilding }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [json, setJson] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);

  const layerProps = {
    onClick: ({ target }) => setBuildingId(target.attributes.id.value),
    onMouseEnter: ({ target }) => setCurrent(target.attributes.id.value.toString()),
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

      const JSONmap = makeJSON(json, oneBuilding);
      setJson(JSONmap);

      // bList = buildingList
      let bList = [];
      for(let i = 0; i < JSONmap.layers.length; i++) {
        bList.push({"id": JSONmap.layers[i].id, "engName": JSONmap.layers[i].en, "islName": JSONmap.layers[i].is})
      }
      setSidebar(bList);
      setImgUrl(apiUrl+"years/"+year+".svg")
    }

    async function fetchBuildingNFinds() {
      setLoading(true);
      setError(null);

      let json;
      const url = apiUrl+"years/"+year+"/buildings/"+buildingId;
      try {
        const result = await fetch(url);
        if (!result.ok) {
          throw new Error('result not ok');
        }
        json = await result.json();

      } catch (e) {
        setError('Cannot get building and finds.');
        return;
      } finally {
        setLoading(false);
      }

      // Make some kind of Json from given finds to display over svg image
      const JSONmap = makeJSON(json, oneBuilding);
      setJson(JSONmap);

      // fList = findsList
      let fList = [];
      for(let i = 0; i < json.finds.length; i++) {
        if(json.finds[i].length > 1) {
          let findIds = [];
          for(let j = 0; j < json.finds[i].length; j++) {
            findIds.push(json.finds[i][j].id);
          }
          fList.push({"id": findIds, "engName": json.finds[i].value})

        } else {
          fList.push({"id": json.finds[i].id, "engName": json.finds[i].en, "islName": json.finds[i].is})
        }
      }
      setSidebar(fList);
      setImgUrl(apiUrl+"years/"+year+"/buildings/"+buildingId+".svg")
    }

    {!oneBuilding && fetchBuildings()}
    {oneBuilding && fetchBuildingNFinds()}
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
          <VectorMap {...json} layerProps={layerProps} currentLayers={[parseInt(current)]} />
        </div>
      </div>
      <img alt='map details' src={imgUrl} className={s.image}/>
    </div>

  )
}
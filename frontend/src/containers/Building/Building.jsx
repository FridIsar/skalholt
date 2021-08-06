import s from './building.module.scss';

import { Redirect, useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
import { Map } from '../../components/Map/Map';
import { Description } from '../../components/Description/Description';
import { MapSidebar } from '../../components/MapSidebar/MapSidebar';

const apiUrl = process.env.REACT_APP_API_URL;

export function Building() {
  // error state if any
  const [error, setError] = useState(null);
  // currently selected interactable
  const [current, setCurrent] = useState(null);
  // data for this building
  const [data, setData] = useState(null);
  // somr indication of what was chosen from the map or sidebar
  const [selectedFind, setSelectedFind] = useState(null);

  // get id and year from params
  const { idNyear } = useParams();
  const split = idNyear.split('-');
  const buildingId = split[0];
  const year = split[1];

  useEffect(() => {
    async function fetchBuilding() {
      let json;
      const url = apiUrl+"years/"+year+"/buildings/"+buildingId;

      try {
        const result = await fetch(url);
        if (!result.ok) {
          throw new Error('result not ok');
        }
        json = await result.json();
      } catch (e) {
        setError(e);
        return;
      } finally {
        setData(json);
      }
    }
    fetchBuilding();

  }, [])

  useEffect(() => {
    // TODO: make redirect to find
    return <Redirect to="/"/>
  }, [selectedFind])

  return (
    <div className={s.container}>
      <MapSidebar items={data?.finds}
        current={current}
        setCurrent={setCurrent}
        setOnClick={setSelectedFind}/>
      <div className={s.mapNDescContainer}>
        <h2>{data?.en + '/' + data?.is + ' - ' + year}</h2>
        <a href={'/'}>Back to site map</a>
        <div className={s.mapContainer}>
          <Map data={data}
            current={current}
            setCurrent={setCurrent}
            loading={!data}
            error={error}/>
        </div>
        {/* TODO: make correct path to moreLink */}
        <Description description={data?.description}
          moreLink={apiUrl}
          limit={300}/>
      </div>
    </div>
  );
}
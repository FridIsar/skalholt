import s from './oneBuilding.module.scss';

import { Redirect, useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
import { Map } from '../../components/Map/Map';
import { Description } from '../../components/Description/Description';
import { MapSidebar } from '../../components/MapSidebar/MapSidebar';
import { SelectionBox } from '../../components/SelectionBox/SelectionBox';

import { joinUrls } from '../../Utils/utils';

const apiUrl = process.env.REACT_APP_API_URL;

export function OneBuilding() {
  // error state if any
  const [error, setError] = useState(null);
  // currently selected interactable
  const [current, setCurrent] = useState(null);
  // data for this building
  const [data, setData] = useState(null);
  // somr indication of what was chosen from the map or sidebar
  const [selectedFind, setSelectedFind] = useState(null);
  // is the description limited
  const [limited, setLimited] = useState(true);

  // get id and year from params
  const { idNyear } = useParams();
  const split = idNyear.split('-');
  const buildingId = split[0];
  const year = split[1];

  useEffect(() => {
    async function fetchBuilding() {
      let json;
      const url = joinUrls(apiUrl+"years/", year, "/buildings/", buildingId);

      try {
        const result = await fetch(url);
        if (!result.ok) {
          throw new Error('result not ok');
        }
        json = await result.json();
      } catch (e) {
        setError("could not get building information")
        return;
      } finally {
        setData(json);
      }
    }
    fetchBuilding();
  },[])

  useEffect(() => {
    // TODO: make redirect to find
    // TODO: use the same method as in wholesite navigation using history!
    return <Redirect to="/"/>
  }, [selectedFind])

  return (
    <div className={s.container}>
      <h2>{data?.en + '/' + data?.is + ' - ' + year}</h2>
      <a href={'/interactive'}>Back to interactive map</a>
      <Description description={data?.description}
        year={year}
        buildingId={buildingId}
        limit={300}
        limited={limited}
        setLimited={setLimited}/>
      {!(data?.image === null) &&
        <div className={s.mapContainer}>
          <img src={joinUrls(apiUrl, data?.image)}
            alt={'Topdown map of ' + data?.en + '/' + data?.is}
            className={s.mapImage}/>
        </div>
      }
      <SelectionBox items={data}
        current={current}
        setCurrent={setCurrent}
        setOnClick={setSelectedFind}/>
      <a href={'/interactive'}>Back to interactive map</a>
    </div>
  );
}
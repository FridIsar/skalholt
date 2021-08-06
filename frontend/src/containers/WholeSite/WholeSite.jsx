import s from './wholeSite.module.scss';

import { Redirect, useHistory, useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
import { Map2 } from '../../components/Map/Map2';
import { MapSidebar } from '../../components/MapSidebar/MapSidebar';
import { Description } from '../../components/Description/Description';
import { MapSidebar2 } from '../../components/MapSidebar/MapSidebar2';
import { MapSlider } from '../../components/MapSlider/MapSlider';

const apiUrl = process.env.REACT_APP_API_URL;

export function WholeSite() {
  // error state if any
  const [error, setError] = useState(null);
  // currently selected interactable
  const [current, setCurrent] = useState(null);
  // data for this map
  const [data, setData] = useState(null);
  const [buildingId, setBuildingID] = useState(null);
  const [year, setYear] = useState(1670);
  const [years, setYears] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  // some indication of what was chosen from the map or sidebar
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const history = useHistory();

  useEffect(() => {
    async function fetchYears() {
      let json;
      const url = apiUrl+"years/";

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
        setYears(json);
        setBackgroundImage(json[0]?.image)
      }
    }
    fetchYears();
  }, [])

  useEffect(() => {
    async function fetchBuildings() {
      let json;
      const url = apiUrl+"years/"+year+"/buildings/";
      console.log(url)

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
    fetchBuildings();
  }, [year])

  useEffect(() => {
    if(selectedBuilding) {
      history.push(`/building/${selectedBuilding}-${year}`);
    }
  }, [selectedBuilding])

  return (
    <div className={s.container}>
      <MapSidebar2 items={data}
        current={current}
        setCurrent={setCurrent}
        setOnClick={setSelectedBuilding}/>
      <div className={s.mapNDescContainer}>
        <div className={s.mapContainer}>
          <Map2 data={data}
            background={backgroundImage}
            current={current}
            setCurrent={setCurrent}
            setOnClick={setSelectedBuilding}
            loading={!data}
            error={error}/>
          <MapSlider value={year}
            range={years}
            setYear={setYear}/>
        </div>
        {/* TODO: make correct path to moreLink */}
        <Description description={years?.filter(y => y.year === year)[0].description}
          moreLink={apiUrl}
          limit={300}/>
      </div>
    </div>
  );
}
import s from './wholeSite.module.scss';

import { useHistory } from "react-router-dom";
import { useEffect, useState } from 'react';
import { Map } from '../../components/Map/Map';
import { Description } from '../../components/Description/Description';
import { MapSidebar } from '../../components/MapSidebar/MapSidebar';
import { MapSlider } from '../../components/MapSlider/MapSlider';
import { SelectionBox } from '../../components/SelectionBox/SelectionBox';

const apiUrl = process.env.REACT_APP_API_URL;

export function WholeSite() {
  // error state if any
  const [error, setError] = useState(null);
  // currently selected interactable
  const [current, setCurrent] = useState(null);
  // data for this map
  const [data, setData] = useState(null);
  const [year, setYear] = useState(1670);
  const [years, setYears] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [expanded, setExpanded] = useState(false);
  // some indication of what was chosen from the map or sidebar
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  // is the description limited
  const [limited, setLimited] = useState(true);

  const history = useHistory();

  function changeYear(year) {
    setYear(year);
    setLimited(true);
  }

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
  }, [selectedBuilding, history, year])

  return (
    <div className={s.container}>
      <Description description={years?.filter(y => y.year === year)[0].description}
        year={year}
        buildingId={null}
        limit={300}
        limited={limited}
        setLimited={setLimited}/>
      {!expanded &&
        <div className={s.mapContainer}>
          <div className={s.map}>
            <Map data={data}
              background={backgroundImage}
              current={current}
              year={year}
              expanded={expanded}
              setExpanded={setExpanded}
              setCurrent={setCurrent}
              setOnClick={setSelectedBuilding}
              loading={!data}
              error={error}/>
          </div>
          <div className={s.slider}>
            <MapSlider value={year}
              range={years}
              changeYear={changeYear}
              setBackgroundImage={setBackgroundImage}/>
          </div>
        </div>
      }
      {expanded &&
        <div className={s.mapContainer}>
          <div className={s.map__expanded}>
            <Map data={data}
              background={backgroundImage}
              current={current}
              year={year}
              expanded={expanded}
              setExpanded={setExpanded}
              setCurrent={setCurrent}
              setOnClick={setSelectedBuilding}
              loading={!data}
              error={error}/>
          </div>

        </div>
      }
      <SelectionBox items={data}
        title="Buildings"
        current={current}
        setCurrent={setCurrent}
        setOnClick={setSelectedBuilding}/>
      {/* TODO: make correct path to moreLink */}
    </div>
  );
}
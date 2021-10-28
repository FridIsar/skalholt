import s from './wholeSite.module.scss';

import { useHistory } from "react-router-dom";
import { useEffect, useState } from 'react';
import { Map } from '../../components/Map/Map';
import { Description } from '../../components/Description/Description';
import { MapSidebar } from '../../components/MapSidebar/MapSidebar';
import { MapSlider } from '../../components/MapSlider/MapSlider';
import { SelectionBox } from '../../components/SelectionBox/SelectionBox';
import { joinUrls } from '../../Utils/utils';

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

  function setBGImageByYear(_year) {
    for (var i = 0; i < years?.length; i++) {
      if (years[i].year === _year) {
        setBackgroundImage(years[i].image);
      }
    }
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
        setBackgroundImage(json[0]?.image);
      }
    }
    fetchYears();
  }, []);

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
  }, [year]);

  useEffect(() => {
    if(selectedBuilding) {
      history.push(`/building/${selectedBuilding}-${year}`);
    }
  }, [selectedBuilding, history, year]);

  useEffect(() => {
    let _year = JSON.parse(window.sessionStorage.getItem('currYear'));
    if (_year) {
      setYear(_year);
      setBGImageByYear(_year);
    }
  }, [years]);

  useEffect(() => {
    window.sessionStorage.setItem('currYear', year);
  }, [year]);

  useEffect(() => {
    async function preLoadMapImages() {
      for (var i = 0; i < years.length; i++) {
        let url = joinUrls(apiUrl, years[i]?.image);

        const map = new Image();
        map.src = url;
      }
    }

    if (years) {
      preLoadMapImages();
    }
  }, [years])

  return (
    <div className={s.container}>
      <Description description={years?.filter(y => y.year === year)[0].description}
        year={year}
        buildingId={null}
        limit={150}
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

    </div>
  );
}
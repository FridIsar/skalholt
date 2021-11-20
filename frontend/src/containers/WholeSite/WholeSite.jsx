import s from './wholeSite.module.scss';

import { useHistory } from "react-router-dom";
import { useEffect, useState } from 'react';
import { Map } from '../../components/Map/Map';
import { Description } from '../../components/Description/Description';
import { MapSlider } from '../../components/MapSlider/MapSlider';
import { SelectionBox } from '../../components/SelectionBox/SelectionBox';
import { joinUrls } from '../../Utils/utils';

// backend root url
const apiUrl = process.env.REACT_APP_API_URL;

/**
 * container for the whole site overview.
 * @returns the view of the whole excavation site
 */
export function WholeSite() {
  // error state if any
  const [error, setError] = useState(null);
  // loading state
  const [loading, setLoading] = useState(true);
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

  // React component that is used to navigate between pages/url's
  const history = useHistory();

  /**
   * sets the year state to the year parameter and the limited state to true
   * @param {Integer} year
   */
  function changeYear(year) {
    setYear(year);
    setLimited(true);
  }

  /**
   * goes through the years state object and sets the background image
   * according to the _year parameter
   * @param {Integer} _year
   */
  function setBGImageByYear(_year) {
    for (var i = 0; i < years?.length; i++) {
      if (years[i].year === _year) {
        setBackgroundImage(years[i].image);
      }
    }
  }

  // Runs when the page loads
  // asks the backend for all possible years and sets the years and background states appropriatly
  useEffect(() => {
    async function fetchYears() {
      let json;
      const url = joinUrls(apiUrl, "years");

      try {
        const result = await fetch(url);
        if (!result.ok) {
          throw new Error('result not ok');
        }
        json = await result.json();
      } catch (e) {
        setError(e.toString());
        return;
      } finally {
        setYears(json);
        setBackgroundImage(json[0]?.image);
        setLoading(false);
      }
    }
    fetchYears();
  }, []);

  // runs every time the years state changes
  // fetches the building information in ragards to the year state from the backend
  // and sets the data state accordingly
  useEffect(() => {
    async function fetchBuildings() {
      let json;
      const url = joinUrls(apiUrl, "/years/", ""+year, "/buildings");

      try {
        const result = await fetch(url);
        if (!result.ok) {
          throw new Error('result not ok');
        }
        json = await result.json();
      } catch (e) {
        setError(e.toString());
        return;
      } finally {
        setData(json);
      }
    }
    fetchBuildings();
  }, [year]);

  // runs if the selectedBuilding state changes
  // will redirect the user to the '/building/selectedBuilding-year' url,
  // which teakes them to the selected builfing
  useEffect(() => {
    if(selectedBuilding) {
      history.push(`/building/${selectedBuilding}-${year}`);
    }
  }, [selectedBuilding, history, year]);

  // runs when the years state changes
  // in order to put the state of the page back to a previous time if the state was saved.
  useEffect(() => {
    let _year = JSON.parse(window.sessionStorage.getItem('currYear'));
    if (_year) {
      setYear(_year);
      setBGImageByYear(_year);
    }
  }, [years]);

  // runs every time the year state is changed
  // saves the state of the page with regards to the year currently chosen
  useEffect(() => {
    window.sessionStorage.setItem('currYear', year);
  }, [year]);

  // runs every time the years state changes
  // only if the years state has been populated will this preload all years background images
  // in production this shortened time waiting for images to load when the year state changed from
  // approx .5sec to .1sec
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

  if (error) {
    return (
      <p>{error}</p>
    )
  }

  if (loading) {
    return (
      <img src='/util/loading.webp' alt='loading gif'/>
    )
  }

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
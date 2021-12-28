import s from './mapInteractable.module.scss';

import { Map } from '../Map/Map';
import { MapSidebar } from '../MapSidebar/MapSidebar';
import { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

const apiUrl = process.env.REACT_APP_API_URL;

export function MapInteractable() {
  // currently selected interactable
  const [current, setCurrent] = useState(null);
  // boolean value for differentiating between whiole site or individual building navigation
  const [oneBuilding, setOneBuilding] = useState(false);
  // values for whole site interactability
  const [buildingList, setBuildingList] = useState([]);
  const [year, setYear] = useState(1670);
  const [allyears, setAllyears] = useState([]);
  // values for individual building interactability
  const [artifactList, setArtifactList] = useState([]);
  const [buildingId, setBuildingId] = useState(null);
  const [building, setBuilding] = useState(null);
  // slider values
  const [sliderValue, setSliderValue] = useState(1670);

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
        return;
      } finally {
        setYear(json[0].year);
      }

      let yearsArray = []
      for(let i = 0; i < json.length; i++) {
        yearsArray.push(json[i].year);
      }
      setAllyears(yearsArray);
    }
    fetchYears();
  }, []);

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
        return;
      } finally {
        setBuilding(json);
      }
      setOneBuilding(true);
    }
    fetchBuilding();

  }, [buildingId])

  // for slider functionallity
  function valuetext(sliderValue) {
    return `${sliderValue}`;
  }

  const onSliderChange = (event, newValue) => {
    setSliderValue(newValue);
  }

  const onSliderChangeCommit = (event, newValue) => {
    setYear(newValue);
  }

  return (
    <div className={s.container}>
      <div className={s.sidebar}>
        {!oneBuilding &&
          <MapSidebar list={buildingList} current={current} setCurrent={setCurrent}/>}
        {oneBuilding &&
          <MapSidebar list={artifactList} current={current} setCurrent={setCurrent}/>}
      </div>
      <div className={s.mapNDescContainer}>
        <div className={s.mapContainer}>
          {!oneBuilding &&
            <Map
              year={year}
              buildingId={buildingId}
              setBuildingId={setBuildingId}
              current={current}
              setCurrent={setCurrent}
              setLayers={setBuildingList}
              oneBuilding={oneBuilding} />}
          {oneBuilding &&
            <Map
            year={year}
            buildingId={buildingId}
            setBuildingId={setBuildingId}
            current={current}
            setCurrent={setCurrent}
            setLayers={setArtifactList}
            oneBuilding={oneBuilding} />}
          <div className={s.slider}>
            <Typography id="discrete-slider-custom" gutterBottom>
              {sliderValue}
            </Typography>
            <Slider
              defaultValue={1670}
              getAriaValueText={valuetext}
              aria-labelledby="discrete-slider-custom"
              valueLabelDisplay="off"
              min={allyears[0]}
              max={allyears[allyears.length-1]}
              step={10}
              onChange={onSliderChange}
              onChangeCommitted={onSliderChangeCommit}
              disabled={oneBuilding}
            />
          </div>
        </div>
        {oneBuilding &&
          <div className={s.description}>
            <p className={s.description__text} >{(building.description).substring(0, 300)+"..."}</p>
            <a className={s.description__link} href={apiUrl}>See more.</a>
            {/* make relative link to an artifact or room */}
          </div>
        }
      </div>
    </div>
  )
}
import s from './mapInteractable.module.scss';

import { Map } from '../Map/Map';
import { MapSidebar } from '../MapSidebar/MapSidebar';
import { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

const apiUrl = process.env.REACT_APP_API_URL;

export function MapInteractable() {
  const [year, setYear] = useState(1670);
  const [allyears, setAllyears] = useState([]);
  const [value, setValue] = useState(1670);

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
        console.log(json[0].year)
        setYear(json[0].year);
      }

      let yearsArray = []
      for(let i = 0; i < json.length; i++) {
        yearsArray.push(json[i].year);
      }

      setAllyears(yearsArray);
      console.log(allyears)
    }
    fetchYears();
  }, []);

  function valuetext(value) {
    return `${value}`;
  }

  const onSliderChange = (event, newValue) => {
    setValue(newValue);
  }

  const onSliderChangeCommit = (event, newValue) => {
    setYear(newValue);
    console.log(year);
  }

  return (
    <div className={s.container}>
      <Map year={year} />
      <div className={s.slider}>
        <Typography id="discrete-slider-custom" gutterBottom>
          {value}
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
        />
      </div>
      <div className={s.sidebar}>
        <MapSidebar/>
      </div>
    </div>
  )
}
import s from './mapInteractable.module.scss';

import { Map } from '../../components/Map/Map';
import { MapSlider } from '../../components/MapSlider/MapSlider';
import { useState } from 'react';

export function MapInteractable() {
  const [year, setYear] = useState(1670);
  const updateYear = ({ year }) => {
    setYear(year);
  }

  return (
    <div className={s.container}>
        <Map year={year} />
        <MapSlider updateYear={updateYear} year={year}/>
    </div>
  )
}
import s from './mapSlider.module.scss';

import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

export function MapSlider({ value, range, changeYear, setBackgroundImage }) {

  function listValueOf(listOfObjects) {
    let list = []

    for (let i = 0; i < listOfObjects?.length; i++) {
      list.push(listOfObjects[i]?.year);
    }

    return list;
  }

  const sliderRange = listValueOf(range);

  function valuetext(sliderValue) {
    return `${sliderValue}`;
  }

  const onSliderChange = (event, newValue) => {
    changeYear(newValue);
    setBackgroundImage(range[sliderRange.indexOf(newValue)]?.image);
  }

  if (value) {
    return (
      <div className={s.slider}>
        <Slider
          defaultValue={1670}
          value={value}
          getAriaValueText={valuetext}
          aria-labelledby="discrete-slider-custom"
          valueLabelDisplay="auto"
          min={sliderRange[0]}
          max={sliderRange[sliderRange.length-1]}
          step={10}
          marks={[{value:1670, label:'1670'},
                  {value:1700, label:'1700'},
                  {value:1750, label:'1750'},
                  {value:1800, label:'1800'},
                  {value:1850, label:'1850'},
                  {value:1900, label:'1900'},
                  {value:1950, label:'1950'}]}
          orientation="vertical"
          onChange={onSliderChange}
          // onChangeCommitted={onSliderChangeCommit}
        />
      </div>
    );
  }
  return null;
}
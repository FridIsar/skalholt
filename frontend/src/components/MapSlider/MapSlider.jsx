import s from './mapSlider.module.scss';

import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

export function MapSlider({ value, range, setYear, setBackgroundImage }) {

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
    setYear(newValue);
    setBackgroundImage(range[sliderRange.indexOf(newValue)]?.image);
  }

  // const onSliderChangeCommit = (event, newValue) => {
  //   setYear(newValue);
  //   setBackgroundImage(range[sliderRange.indexOf(newValue)]?.image);
  // }

  return (
    <div className={s.slider}>
      <Typography id="discrete-slider-custom" gutterBottom>
        {value}
      </Typography>
      <Slider
        defaultValue={1670}
        getAriaValueText={valuetext}
        aria-labelledby="discrete-slider-custom"
        valueLabelDisplay="off"
        min={sliderRange[0]}
        max={sliderRange[sliderRange.length-1]}
        step={10}
        onChange={onSliderChange}
        // onChangeCommitted={onSliderChangeCommit}
      />
    </div>
  );
}
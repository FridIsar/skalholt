import s from './mapSlider.module.scss';

import Slider from '@material-ui/core/Slider';

/**
 * A map slider that interacts with the connected map
 *
 * all params are props
 * @param value Integer that tells what vbalue is chosen currently
 * @param range [...Integer] says what values are available in the slider
 * @param changeYear callback that cahnges the value higher up the higherarchy
 * @param setBackgroundImage callback that sets the image for the connected map
 * @returns a slider taht interacts with the connected map
 */
export function MapSlider({ value, range, changeYear, setBackgroundImage }) {

  // function that takes a list of objects and extracts the year
  // property of those objects and returns them in a list
  function listValueOf(listOfObjects) {
    let list = []

    for (let i = 0; i < listOfObjects?.length; i++) {
      list.push(listOfObjects[i]?.year);
    }

    return list;
  }

  // extract the year property from range
  const sliderRange = listValueOf(range);

  // changes Integer value to String value
  function valuetext(sliderValue) {
    return `${sliderValue}`;
  }

  // The callback for when the slider value is changed
  const onSliderChange = (event, newValue) => {
    changeYear(newValue);
    setBackgroundImage(range[sliderRange.indexOf(newValue)]?.image);
  }

  // if a value is given then display the slider
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

  // if no value is given then return null
  return null;
}
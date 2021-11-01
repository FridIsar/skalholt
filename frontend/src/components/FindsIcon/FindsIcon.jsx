import s from './FindsIcon.module.scss';

import { joinUrls } from '../../Utils/utils';
import Popover from '@material-ui/core/Popover';
import Popper from '@material-ui/core/Popper';
import { useState } from 'react';

// backend root url
const apiUrl = process.env.REACT_APP_API_URL;

/**
 *
 * all params are props
 * @param fGroup String for this finds group, a key of sorts
 * @param fragments Integer for how many of this was found
 * @param index Integer for react to keep track of lists
 * @param iconData JSON with data regarding the Icon mainly a href for the downloadable link
 * @returns a icon representing this type of find and how many were found
 */
export function FindsIcon({fGroup, fragments, index, iconData}) {
  // states for the onhover and onclick popover and popper effects
  const [anchorElClick, setAnchorElClick] = useState(null);
  const [anchorElHover, setAnchorElHover] = useState(null);

  //background image
  var bImage = {backgroundImage: `url(/findsIcons/${fGroup}.ico)`}

  // if clicked the open the onclick popover
  function onclick(event) {
    setAnchorElClick(event?.target)
  }

  // if clicked of the popover when it is open then close it
  const closePopOverClick = () => {
    setAnchorElClick(null);
  }

  // if you hover off the item thne close the popper
  const closePopOverHover = () => {
    setAnchorElHover(null);
  }

  // if you hover over the itme then open the popper
  function onEnter(event) {
    setAnchorElHover(event?.target);
  }

  // general manipulation for the popover and popper
  const openClick = Boolean(anchorElClick);
  const openHover = Boolean(anchorElHover);

  return (
    <div className={s.iconWrapper}>
      <button className={s.icon}
        id={fGroup}
        key={index}
        onClick={onclick}
        style={bImage}
        onMouseOver={onEnter}
        onMouseLeave={closePopOverHover}
      />
      <p className={s.icon__units}>
        {"x" + fragments}
      </p>
      <Popover
        id={fGroup}
        open={openClick}
        anchorEl={anchorElClick}
        onClose={closePopOverClick}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <div className={s.popover}>
          <h5 className={s.popover__header}>
            {fGroup + " x" + fragments}
          </h5>
          <p className={s.popover__description}>
            More information found in documentation:
          </p>
          <a
            className={s.popover__downloadLink}
            href={joinUrls(apiUrl, iconData?.href)}
          >
            Download documentation
          </a>
        </div>
      </Popover>
      <Popper
        id={fGroup}
        open={openHover}
        anchorEl={anchorElHover}
        placement={'top'}
      >
        <p className={s.popper__text}>{fGroup + " x" + fragments}</p>
      </Popper>
    </div>
  )

}
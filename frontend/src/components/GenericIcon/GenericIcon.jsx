import s from "./genericIcon.module.scss";

import Popover from '@material-ui/core/Popover';
import { useState } from 'react';

export function GenericIcon({imageUrl, index, popOverElement}) {
  const [anchorElClick, setAnchorElClick] = useState(null);
  const [anchorElHover, setAnchorElHover] = useState(null);

  //background image
  var bImage = {backgroundImage: `url(${imageUrl})`}

  function onclick(event) {
    setAnchorElClick(event?.target)
  }

  const closePopOverClick = () => {
    setAnchorElClick(null);
  }

  const closePopOverHover = () => {
    setAnchorElHover(null);
  }

  function onEnter(event) {
    setAnchorElHover(event?.target);
  }

  const openClick = Boolean(anchorElClick);
  const openHover = Boolean(anchorElHover);

  return (
    <div className={s.iconWrapper}>
      <button className={s.icon}
        id={index}
        key={index}
        onClick={onclick}
        style={bImage}
        onMouseOver={onEnter}
        onMouseLeave={closePopOverHover}
        // onMouseOver={onHover}
        // onMouseMove={closePopOverHover}
      />
      <Popover
        id={index}
        open={openClick}
        anchorEl={anchorElClick}
        onClose={closePopOverClick}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {popOverElement}
      </Popover>
    </div>
  )
}
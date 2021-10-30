import s from "./genericIcon.module.scss";

import Popover from '@material-ui/core/Popover';
import { useState } from 'react';

/**
 * Generic icon with pop over implementation
 *
 * all params are props
 * @param imageUrl String url to the icon image
 * @param index Integer for react to have unique keys for items in lists
 * @param popOverElement Element to put into the popOver taht appears onclick
 * @returns a generic icon that displays a popOver
 */
export function GenericIcon({imageUrl, index, popOverElement}) {
  const [anchorElClick, setAnchorElClick] = useState(null);

  //background image
  var bImage = {backgroundImage: `url(${imageUrl})`}

  // if clicked the open the onclick popover
  function onclick(event) {
    setAnchorElClick(event?.target)
  }

  // if clicked of the popover when it is open then close
  const closePopOverClick = () => {
    setAnchorElClick(null);
  }

  // general manipulation for the popover
  const openClick = Boolean(anchorElClick);

  return (
    <div className={s.iconWrapper}>
      <button className={s.icon}
        id={index}
        key={index}
        onClick={onclick}
        style={bImage}
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
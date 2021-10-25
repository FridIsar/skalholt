import s from './FindsIcon.module.scss';


import { joinUrls } from '../../Utils/utils';
import Popover from '@material-ui/core/Popover';
import Popper from '@material-ui/core/Popper';
import { useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;

export function FindsIcon({fGroup, fragments, index, iconData}) {

  const [anchorElClick, setAnchorElClick] = useState(null);
  const [anchorElHover, setAnchorElHover] = useState(null);

  //background image
  var bImage = {backgroundImage: `url(/findsIcons/${fGroup}.ico)`}

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
        id={fGroup}
        key={index}
        onClick={onclick}
        style={bImage}
        onMouseOver={onEnter}
        onMouseLeave={closePopOverHover}
        // onMouseOver={onHover}
        // onMouseMove={closePopOverHover}
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
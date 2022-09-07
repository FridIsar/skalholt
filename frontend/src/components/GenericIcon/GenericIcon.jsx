import s from "./genericIcon.module.scss";

import Popover from '@material-ui/core/Popover';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

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
export function GenericIcon({imageUrl, index, dataHref, dataType, dataYear, popOverElement}) {
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
    <TableRow
      key={index}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell component="th" scope="row">{dataYear}</TableCell>
      <TableCell align="right">{dataType}</TableCell>
      <TableCell align="right"><a href={dataHref}>Open/Download</a></TableCell>
    </TableRow>

    // <div className={s.iconWrapper}>
    //   <button className={s.icon}
    //     id={index}
    //     key={index}
    //     onClick={onclick}
    //     style={bImage}
    //   />
    //   {popOverElement}
    //   <Popover
    //     id={index}
    //     open={openClick}
    //     anchorEl={anchorElClick}
    //     onClose={closePopOverClick}
    //     anchorOrigin={{
    //       vertical: 'top',
    //       horizontal: 'right',
    //     }}
    //   >
    //     {popOverElement}
    //   </Popover>
    // </div>
  )
}
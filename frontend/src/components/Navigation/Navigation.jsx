import s from './navigation.module.scss';

import Cookies from 'universal-cookie';
import Popper from '@material-ui/core/Popper';
import React, { useState, useEffect } from 'react';

/**
 * The navigation bar
 * @param {*} onHome Boolean lets know if already on the home page
 * @returns navigation bar with logo and links to other pages
 */
export function Navigation({ onHome }) {

  const [scrolled, setScrolled] = React.useState(false);
  const [width, setWidth] = useState(window.innerWidth);

function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
      window.addEventListener('resize', handleWindowSizeChange);
      return () => {
          window.removeEventListener('resize', handleWindowSizeChange);
      }
  }, []);

  const isMobile = width <= 768;  


  useEffect(() =>  {
    console.log("state: ", scrolled);
  }, [scrolled]);

  const handleScroll=(e) => {
    console.log("e:", e.currentTarget.scrollTop);

    const offset = e.currentTarget.scrollTop;

    if(offset > 200 ){
      setScrolled(true);
      console.log('passed');
    }
    else{
      setScrolled(false);
    }
  }

  useEffect(() => {
      const el = document.getElementById('index-ID')
      if (el) el.addEventListener('scroll', handleScroll);
      return () => {
        if (el) el.remoteEventListener('scroll', handleScroll);
      }
    }, [])

  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);

  // cookies are used to tell if the user is admin or not
  const cookies = new Cookies();
  const admin = cookies.get('admin');

  // removes the admin cookie and therefore logs admin out
  const logout = () => {
    cookies.remove('admin');
  }

  function showBurgerMenu(event) {
    console.log(event?.target)
    setAnchorEl(event?.target);
    setOpen(!open);
    console.log("burger pressed")
  }

  return (

    <div className="navbar">

      { isMobile ? 
        <div className={s.mobile_navbar} >
            <a href="/">About</a>
            <a href="/raw">Project data</a>
            <a href="/interactive">Interactive map</a>
          </div> 
          : null
      }

      { onHome ? <div>
        {scrolled ? 
        <div className={s.scrolled} >
          <a href="/">About</a>
          <a href="/raw">Project data</a>
          <a href="/interactive">Interactive map</a>
        </div>
       : 
        <div className={s.header_scrolled}>
          <a href="/">About</a>
          <a href="/raw">Project data</a>
          <a href="/interactive">Interactive map</a>
        </div>
       } 
      </div>
      : 
      <div className={s.not_home_page} >
        <a href="/">About</a>
        <a href="/raw">Project data</a>
        <a href="/interactive">Interactive map</a>
      </div>}
    </div>
  )
}
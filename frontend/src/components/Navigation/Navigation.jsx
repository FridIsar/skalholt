import s from './navigation.module.scss';

import Cookies from 'universal-cookie';
import Popper from '@material-ui/core/Popper';
import { useState } from 'react';

/**
 * The navigation bar
 * @param {*} onHome Boolean lets know if already on the home page
 * @returns navigation bar with logo and links to other pages
 */
export function Navigation({ onHome }) {
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
    <nav className={s.navigation}>
      <div className={s.navigation__bar}>
        <a className={s.navigation__imageContainer} href={'/'}>
          <img className={s.navigation__image_desktop}
            alt="Skalholt Excavations 2002-7, logo"
            src='/logo/logo_modified.svg'/>
          <img className={s.navigation__image_mobile}
            alt="Skalholt Excavations 2002-7, logo"
            src='/logo/logo_mobile.svg'/>
        </a>
        <div className={s.navigation__content}>
          {!onHome &&
            <a className={s.navigation__content__link} href="/">
              <h1 className={s.navigation__content__text}>
                Home
              </h1>
            </a>
          }
          <a className={s.navigation__content__link} href="/raw">
            <h1 className={s.navigation__content__text}>
              Project data
            </h1>
          </a>
          <a className={s.navigation__content__link} href="/interactive">
            <h1 className={s.navigation__content__text}>
              Interactive map
            </h1>
          </a>
          {admin &&
            <a className={s.navigation__content__link} href="/" onClick={logout}>
              <h1 className={s.navigation__content__text}>
                Logout
              </h1>
            </a>
          }
          <button
            className={s.navigation__burger}
            onClick={showBurgerMenu}
            style={{backgroundImage: `url(${'/util/burger-menu.svg'})`}}
          />
          <Popper open={open} anchorEl={anchorEl} placement={'bottom-end'}>
            <div className={s.navigation__menu}>
              {!onHome &&
                <a className={s.navigation__menu__link} href="/">
                  <h1 className={s.navigation__menu__text}>
                    Home
                  </h1>
                </a>
              }
              <a className={s.navigation__menu__link} href="/raw">
                <h1 className={s.navigation__menu__text}>
                  Project data
                </h1>
              </a>
              <a className={s.navigation__menu__link} href="/interactive">
                <h1 className={s.navigation__menu__text}>
                  Interactive map
                </h1>
              </a>
              {admin &&
                <a className={s.navigation__menu__link} href="/" onClick={logout}>
                  <h1 className={s.navigation__menu__text}>
                    Logout
                  </h1>
                </a>
              }
            </div>
          </Popper>
        </div>
      </div>
    </nav>
  )
}
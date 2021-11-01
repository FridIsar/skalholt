import s from './navigation.module.scss';

import Cookies from 'universal-cookie';

/**
 * The navigation bar
 * @param {*} onHome Boolean lets know if already on the home page
 * @returns navigation bar with logo and links to other pages
 */
export function Navigation({ onHome }) {

  // cookies are used to tell if the user is admin or not
  const cookies = new Cookies();
  const admin = cookies.get('admin');

  // removes the admin cookie and therefore logs admin out
  const logout = () => {
    cookies.remove('admin');
  }

  return (
    <nav className={s.navigation}>
      <div className={s.navigation__bar}>
        <a href={'/'}>
          <img className={s.navigation__image}
            alt="Skalholt Excavations 2002-7, logo"
            src='/logo/logo_modified.svg'/>
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
        </div>
      </div>
    </nav>
  )
}
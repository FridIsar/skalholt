import s from './navigation.module.scss';

import Cookies from 'universal-cookie';

export function Navigation() {

  const cookies = new Cookies();
  const admin = cookies.get('admin');

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
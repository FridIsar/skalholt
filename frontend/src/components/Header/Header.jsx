import s from './header.module.scss';

import Cookies from 'universal-cookie';

export function Header() {

  const cookies = new Cookies();
  const admin = cookies.get('admin');
  console.log(admin);

  const logout = () => {
    cookies.remove('admin');
  }

  return (
    <header className={s.header}>
      <a href={'/'}><img className={s.header__image} src='/logo_modified.svg'/></a>
      <div className={s.header__content}>
        <a className={s.header__content__link} href="/raw"><h1 className={s.header__content__text}>Raw data</h1></a>
        <a className={s.header__content__link} href="/about"><h1 className={s.header__content__text}>The Project</h1></a>
        {admin &&
          <a className={s.header__content__link} href="/" onClick={logout}><h1 className={s.header__content__text}>Logout</h1></a>
        }
      </div>
    </header>
  )
}
import s from './header.module.scss';


export function Header() {

  return (
    <header className={s.header}>
      <a href={'/'}><img className={s.header__image} src='/logo_modified.svg'/></a>
      <div className={s.header__content}>
        <a className={s.header__content__link} href="/projectdetails"><h1 className={s.header__content__text}>Raw data</h1></a>
        <a className={s.header__content__link} href="/about"><h1 className={s.header__content__text}>About the Project</h1></a>
      </div>
    </header>
  )
}
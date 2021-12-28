import s from './header.module.scss';


export function Header() {
  return (
    <header className={s.header}>
      <h1 className={s.header__content}>Lorum ipsum</h1>
      <h1 className={s.header__content}>Lorum ipsum</h1>
      <h1 className={s.header__content}>Lorum ipsum</h1>
      <h1 className={s.header__content}>Lorum ipsum</h1>
      <h1 className={s.header__content}>Lorum ipsum</h1>
    </header>
  )
}
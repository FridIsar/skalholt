import s from "./link.module.scss";


export function Link({ href, title, description }) {

  return (
    <a href={href} className={s.link}>{title}</a>
  );
}
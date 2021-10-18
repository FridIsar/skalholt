import s from './indexImage.module.scss';

export function IndexImage() {


  return (

    <div className={s.image}>
      <div className={s.image__figContainer}>
        <figure className={s.image__figure}>
          <img src='/frontpageImg/overview.JPG' className={s.image__pic}/>
          <figcaption className={s.image__figcaption}>
            The Skálholt site like it is today.
          </figcaption>
        </figure>
        <div className={s.image__blur} style={{backgroundImage: "url(/frontpageImg/overview.JPG)"}}/>
        <a href="#content"><button className={s.image__button} style={{backgroundImage: "url(/util/down-arrow.svg)"}}/></a>
      </div>
    </div>
  );
}
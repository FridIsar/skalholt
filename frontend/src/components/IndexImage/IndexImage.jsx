import s from './indexImage.module.scss';

export function IndexImage() {


  return (

    <div className={s.image}>
      <div className={s.image__figContainer}>
        <figure className={s.image__figure}>
          <img src='/frontpageImg/overview.JPG' className={s.image__pic}/>
          <figcaption className={s.image__figcaption}>
            Photo by <a>someone</a>, of the excavations in progress.
          </figcaption>
        </figure>
        <div className={s.image__blur} style={{backgroundImage: "url(/frontpageImg/overview.JPG)"}}/>
        <a href="#content"><button className={s.image__button} style={{backgroundImage: "url(/util/down-arrow.svg)"}}/></a>
      </div>
    </div>
  );
}
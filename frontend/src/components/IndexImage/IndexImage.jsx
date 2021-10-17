import s from './indexImage.module.scss';

export function IndexImage() {


  return (

    <div className={s.image}>
      <div className={s.image__figContainer}>
        <figure className={s.image__figure}>
          <img src='/frontpageImg/vinnumynd.jpg' className={s.image__pic}/>
          <figcaption className={s.page__figcaption}>
            Photo by <a>someone</a>, of the excavations in progress.
          </figcaption>
        </figure>
        <div className={s.image__blur}/>
        <a href="#content"><button className={s.image__button} style={{backgroundImage: "url(/down-arrow.svg)"}}/></a>
      </div>
    </div>
  );
}
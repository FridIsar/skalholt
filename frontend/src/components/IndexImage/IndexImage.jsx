import s from './indexImage.module.scss';

/**
 *
 * @returns The front page main image with an arrow taht lets the user view the content of the page
 */
export function IndexImage() {

  return (
    <div className={s.image}>
      <div className={s.image__figContainer}>
        <figure className={s.image__figure}>
          <img src='/frontpageImg/frontPageImg.jpeg' className={s.image__pic} alt="Overview of skálholt"/>
        </figure>
        <img src='/logo-skalholt-hvitt.svg' className={s.image__logo} alt="Skálholt"/>
        <div className={s.image__blur} style={{backgroundImage: "url(/frontpageImg/overview.jpeg)"}}/>
        {/* <a href="#content"><button className={s.image__button} style={{backgroundImage: "url(/util/down-arrow.svg)"}}/></a> */}
      </div>
    </div>
  );
}
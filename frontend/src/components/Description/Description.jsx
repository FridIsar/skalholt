import s from './description.module.scss';




export function Description({ description, moreLink, limit }) {

  return (
  <div className={s.description}>
    {limit &&
      <p className={s.description__text} >{description?.substring(0, limit)+"..."}</p>
    }
    {!limit &&
      <p className={s.description__text} >{description}</p>
    }
    {moreLink &&
      <a className={s.description__link} href={moreLink}>See more.</a>
    }
    {/* make relative link to an artifact or room */}
  </div>
  )
}
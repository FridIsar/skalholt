import s from './paragraph.module.scss';



export function Paragraph({ text, title, image, horizontal, invert }) {



  return (
    <div className={s.paragraph}>
      {(horizontal && invert) &&
        <div className={s.paragraph__horizontal}>
          <img className={s.paragraph__horizontal__image}
            src={image}
            alt='Image to represent following paragraph/s'/>
          <div className={s.paragraph__horizontal__titleNtext}>
            <h2 className={s.paragraph__title}>{title}</h2>
            <p className={s.paragraph__text}>
              {text}
            </p>
          </div>
        </div>
      }
      {(horizontal && !invert) &&
        <div className={s.paragraph__horizontal}>
          <div className={s.paragraph__horizontal__titleNtext}>
            <h2 className={s.paragraph__title}>{title}</h2>
            <p className={s.paragraph__text}>
              {text}
            </p>
          </div>
          <img className={s.paragraph__horizontal__image}
            src={image}
            alt='Image to represent following paragraph/s'/>
        </div>
      }
      {(!horizontal && invert) &&
        <div className={s.paragraph__vertical}>
          <img className={s.paragraph__vertical__image}
            src={image}
            alt='Image to represent following paragraph/s'/>
          <div className={s.paragraph__vertical__titleNtext}>
            <h2 className={s.paragraph__title}>{title}</h2>
            <p className={s.paragraph__text}>
              {text}
            </p>
          </div>
        </div>
      }
      {(!horizontal && !invert) &&
        <div className={s.paragraph__vertical}>
          <div className={s.paragraph__vertical__titleNtext}>
            <h2 className={s.paragraph__title}>{title}</h2>
            <p className={s.paragraph__text}>
              {text}
            </p>
          </div>
          <img className={s.paragraph__vertical__image}
            src={image}
            alt='Image to represent following paragraph/s'/>
        </div>
      }
    </div>
  )
}
import s from './description.module.scss';

import { useState } from 'react';


export function Description({ description, limit }) {
  const [limited, setLimited] = useState(true);

  if (!limit) {
    setLimited(false);
  }

  const onClick = () => {
    setLimited(!limited);
  }

  return (
  <div className={s.description}>
    {limited &&
      <p className={s.description__text} >{description?.substring(0, limit)+"..."}</p>
    }
    {!limited &&
      <p className={s.description__text} >{description}</p>
    }
    {(limited && limit) &&
      <a className={s.description__link} onClick={onClick}>See more.</a>
    }
    {(!limited && limit) &&
      <a className={s.description__link} onClick={onClick}>See less.</a>
    }
  </div>
  )
}
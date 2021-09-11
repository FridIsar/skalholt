import s from './index.module.scss';

import { Navigation } from '../../components/Navigation/Navigation'
import { WholeSite } from '../../containers/WholeSite/WholeSite';


export function Index() {
  return (
    <div className={s.page}>
      <div className={s.page__header}>
        <Navigation/>
      </div>
      <figure className={s.page__figure}>
        <img src='/vinnumynd.jpg' className={s.page__pic}/>
        <figcaption className={s.page__figcaption}>
          Photo by <a>someone</a>, of the excavations in progress.
        </figcaption>
      </figure>

      <div className={s.page__content}>
        <WholeSite/>
      </div>
    </div>
  )
}
import s from './interactiveMap.module.scss';

import { WholeSite } from '../../containers/WholeSite/WholeSite';
import { Navigation } from '../../components/Navigation/Navigation'



export function InteractiveMap ({}) {
  return (
    <div className={s.page}>
      <div className={s.page__header}>
          <Navigation/>
        </div>
      <div className={s.page__content}>
        <WholeSite/>
      </div>
    </div>
  )
}
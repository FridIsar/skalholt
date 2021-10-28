import s from './interactiveMap.module.scss';

import { WholeSite } from '../../containers/WholeSite/WholeSite';
import { Navigation } from '../../components/Navigation/Navigation'
import { AllowCookies } from '../../components/AllowCookies/AllowCookies';



export function InteractiveMap ({}) {
  return (
    <div className={s.page}>
      <AllowCookies/>
      <div className={s.page__header}>
          <Navigation/>
        </div>
      <div className={s.page__content}>
        <WholeSite/>
      </div>
    </div>
  )
}
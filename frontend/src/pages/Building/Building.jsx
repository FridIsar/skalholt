import s from './building.module.scss';

import { Navigation } from '../../components/Navigation/Navigation'
import { OneBuilding } from '../../containers/OneBuilding/OneBuilding'
import { AllowCookies } from '../../components/AllowCookies/AllowCookies';


export function Building() {
  return (
    <div className={s.page}>
      <AllowCookies/>
      <div className={s.page__header}>
        <Navigation/>
      </div>
      <div className={s.page__content}>
        <OneBuilding/>
      </div>
    </div>
  )
}
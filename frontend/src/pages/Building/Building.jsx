import s from './building.module.scss';

import { Navigation } from '../../components/Navigation/Navigation'
import { OneBuilding } from '../../containers/OneBuilding/OneBuilding'


export function Building() {
  return (
    <div className={s.page}>
      <div className={s.page__header}>
        <Navigation/>
      </div>
      <div className={s.page__content}>
        <OneBuilding/>
      </div>
    </div>
  )
}
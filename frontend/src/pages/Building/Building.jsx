import s from './building.module.scss';

import { Header } from '../../components/Header/Header'
import { OneBuilding } from '../../containers/OneBuilding/OneBuilding'


export function Building() {
  return (
    <div className={s.page}>
      <div className={s.page__header}>
        <Header/>
      </div>
      <div className={s.page__content}>
        <OneBuilding/>
      </div>
    </div>
  )
}
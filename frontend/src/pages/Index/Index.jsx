import s from './index.module.scss';

import { Header } from '../../components/Header/Header'
import { MapInteractable } from '../../components/MapInteractable/MapInteractable'


export function Index() {
  return (
    <div className={s.page}>
      <div className={s.page__header}>
        <Header/>
      </div>
      <div className={s.page__content}>
        <MapInteractable/>
      </div>
    </div>
  )
}
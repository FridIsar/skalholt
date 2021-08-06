import s from './index.module.scss';

import { Header } from '../../components/Header/Header'
import { WholeSite } from '../../containers/WholeSite/WholeSite';


export function Index() {
  return (
    <div className={s.page}>
      <div className={s.page__header}>
        <Header/>
      </div>
      <div className={s.page__content}>
        <WholeSite/>
      </div>
    </div>
  )
}
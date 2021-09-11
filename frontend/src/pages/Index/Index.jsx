import s from './index.module.scss';

import { Navigation } from '../../components/Navigation/Navigation'
import { WholeSite } from '../../containers/WholeSite/WholeSite';


export function Index() {
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
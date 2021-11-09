import s from './index.module.scss';

import { Navigation } from '../../components/Navigation/Navigation'
import { IndexImage } from '../../components/IndexImage/IndexImage';
import { About } from '../../components/About/About';
import { AllowCookies } from '../../components/AllowCookies/AllowCookies';

export function Index() {
  return (
    <div className={s.page}>
      <AllowCookies/>
      <Navigation onHome={true}/>
      <div className={s.page__image}>
        <IndexImage/>
      </div>
      <div id="content" className={s.page__about}>
        <img className={s.page__about__bgImg} src={'/frontpageImg/vinnumynd.jpg'} alt="Excavations in progress"/>
        <About/>
      </div>
    </div>
  )
}
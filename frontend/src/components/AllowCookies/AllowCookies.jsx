import s from './allowCookies.module.scss';

import Cookies from 'universal-cookie';
import { useState } from 'react';


export function AllowCookies() {

  const [allowed, setAllowed] = useState(null);

  const cookies = new Cookies();
  const theCookie = cookies.get('CookiesAllowed');

  if (theCookie !== allowed) {
    setAllowed(theCookie);
  }


  function onClick() {
    cookies.set('CookiesAllowed', true);
    setAllowed(false);
  }

console.log(allowed)

  if(!allowed) {
    return (
      <div className={s.page}>
        <div className={s.cover}/>
        <div className={s.cookieRequest}>
          <div className={s.textBox}>
            <p className={s.text}>This site uses cookies to provide necessary website functionality.</p>
            <p className={s.text}>No personal information is used or shared by this website.</p>
            <p className={s.text}>By clicking "I understand" you agree to our use of cookies for required website functionality.</p>
          </div>
          <button className={s.button} onClick={onClick}>I understand</button>
        </div>
      </div>
    );
  }

  return null;
}
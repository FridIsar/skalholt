import s from './allowCookies.module.scss';

import Cookies from 'universal-cookie';
import { useState } from 'react';

/**
 * makes a request for use of cookies if htey haven't been accepted already
 * @returns the view for the cookie request
 */
export function AllowCookies() {
  // state that tells if cookies have already been allowed use
  const [allowed, setAllowed] = useState(null);

  // get the cookie from the browser if it is there
  const cookies = new Cookies();
  const theCookie = cookies.get('CookiesAllowed');

  // if the cookie from the browser and the saved state are not the same then
  // make the state the cookie from the browser (can be undefined if no cookie was
  // found in the browser)
  if (theCookie !== allowed) {
    setAllowed(theCookie);
  }

  // function that is called when the user accepts the use of cookies
  // sets the cookie that tells the system that cookies are now allowed and sets the state accordingly
  function onClick() {
    cookies.set('CookiesAllowed', true);
    setAllowed(false);
  }

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
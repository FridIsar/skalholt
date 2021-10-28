import s from "./login.module.scss";

import { LoginForm } from "../../components/LoginForm/LoginForm";
import { Navigation } from "../../components/Navigation/Navigation";
import { AllowCookies } from "../../components/AllowCookies/AllowCookies";


export function Login() {
  return (
    <div className={s.page}>
      <AllowCookies/>
      <div className={s.page__header}>
        <Navigation/>
      </div>
      <div className={s.form}>
        <LoginForm/>
      </div>
    </div>
  )
}
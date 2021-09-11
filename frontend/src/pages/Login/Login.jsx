import s from "./login.module.scss";

import { LoginForm } from "../../components/LoginForm/LoginForm";
import { Navigation } from "../../components/Navigation/Navigation";


export function Login() {
  return (
    <div className={s.page}>
      <div className={s.page__header}>
        <Navigation/>
      </div>
      <div className={s.form}>
        <LoginForm/>
      </div>
    </div>
  )
}
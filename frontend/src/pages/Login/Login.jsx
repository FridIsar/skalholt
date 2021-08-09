import s from "./login.module.scss";

import { LoginForm } from "../../components/LoginForm/LoginForm";
import { Header } from "../../components/Header/Header";


export function Login() {
  return (
    <div className={s.page}>
      <div className={s.page__header}>
        <Header/>
      </div>
      <div className={s.form}>
        <LoginForm/>
      </div>
    </div>
  )
}
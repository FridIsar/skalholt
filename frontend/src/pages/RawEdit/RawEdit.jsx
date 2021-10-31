import s from "./rawEdit.module.scss";

import { Navigation } from "../../components/Navigation/Navigation";
import { AddRawForm } from "../../components/AddRawForm/AddRawForm";
import { AllowCookies } from "../../components/AllowCookies/AllowCookies";

export function RawEdit() {

  return (
    <div className={s.page}>
      <AllowCookies/>
      <Navigation/>
      <AddRawForm/>
    </div>
  );
}
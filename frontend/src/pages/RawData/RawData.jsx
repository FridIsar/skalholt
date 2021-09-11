import s from "./rawData.module.scss";

import { Navigation } from "../../components/Navigation/Navigation";
import { RawLinks } from "../../containers/RawLinks/RawLinks";

export function RawData() {

  return (
    <div className={s.page}>
      <div className={s.page__header}>
        <Navigation/>
      </div>
      <div className={s.page__links}>
        <RawLinks/>
      </div>
    </div>
  );
}
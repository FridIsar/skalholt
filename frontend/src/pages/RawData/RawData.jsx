import s from "./rawData.module.scss";

import { Header } from "../../components/Header/Header";
import { RawLinks } from "../../containers/RawLinks/RawLinks";

export function RawData({  }) {

  return (
    <div className={s.page}>
      <div className={s.page__header}>
        <Header/>
      </div>
      <div className={s.page__links}>
        <RawLinks/>
      </div>
    </div>
  );
}
import s from "./generalList.module.scss";

import { joinUrls } from "../../Utils/utils";

const apiUrl = process.env.REACT_APP_API_URL;

export function GeneralList({list}) {

  return (
    <div className={s.container}>
      <h1 className={s.title}>{list[0].major_group}</h1>
      <ul className={s.list}>
        {list.map((value, index) => {
          return (
            <li className={s.list__child} key={index}>
              <a href={joinUrls(apiUrl, value?.href)}>
                {value?.tag}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

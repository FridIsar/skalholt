import s from "./rawLinks.module.scss";

import { Link } from "../../components/Link/Link";
import { useEffect } from "react";
import { useState } from "react";
import { joinUrls } from "../../Utils/utils";
import { GeneralList } from "../../components/GeneralList/GeneralList";

const apiUrl = process.env.REACT_APP_API_URL;

export function RawLinks() {
  const [linksByGroup, setLinksByGroup] = useState([]);

  useEffect(() => {
    async function fetchLinks() {
      const url = apiUrl + 'files';

      let json;
      try {
        const result = await fetch(url);
        if (!result.ok) {
          throw new Error('result not ok');
        }
        json = await result.json();
      } catch (e) {
        return;
      } finally {

        let grouped = json.reduce((r, a) => {
          r[a.major_group] = [...r[a.major_group] || [], a];
          return r;
         }, {});

        setLinksByGroup(grouped);
      }
    }

    fetchLinks();
  }, [])

  return (
    <div className={s.links}>
      {Object.keys(linksByGroup).map((key, index) => {
        return (
          <GeneralList list={linksByGroup[key]} key={index}/>
        )
      })}
    </div>
  );
}
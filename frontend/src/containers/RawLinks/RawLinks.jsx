import s from "./rawLinks.module.scss";

import { Link } from "../../components/Link/Link";
import { useEffect } from "react";
import { useState } from "react";
import { joinUrls } from "../../Utils/utils";

const apiUrl = process.env.REACT_APP_API_URL;

export function RawLinks() {
  const [links, setLinks] = useState([]);

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
        setLinks(json);
      }
    }

    fetchLinks();
  }, [])

  return (
    <div className={s.links}>
      {links.map((value, index) => {
        return (
          <Link
            key={index}
            href={joinUrls(apiUrl, value?.href)}
            title={value?.tag}/>
        )
      })}
    </div>
  );
}
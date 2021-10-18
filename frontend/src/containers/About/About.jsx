import s from './about.module.scss';

import { Paragraph } from '../../components/Paragraph/Paragraph';
import { useEffect, useState } from 'react';


export function About() {
  const [paragraphs, setParagraphs] = useState(null);

  useEffect(() => {
    async function fetchText() {

      let json;
      try {
        const result = await fetch('/text/about.txt');
        if (!result.ok) {
          throw new Error('result not ok');
        }
        json = await result.text();
      } catch (e) {
        return;
      } finally {

        var splitToParagraphs = json.split("\n");

        setParagraphs(splitToParagraphs);
      }
    }

    fetchText();
  }, []);

  if (paragraphs) {
    return (
      <div className={s.about}>

        <h2 className={s.title}>{"About the project"}</h2>
        <div className={s.section}>
          <p className={s.text}>{paragraphs[0]}</p>
        </div>
        <div className={s.section}>
          <p className={s.text}>{paragraphs[1]}</p>
        </div>
        <div className={s.section}>
          {/* <img className={s.image} src='/frontpageImg/vinnumynd.jpg' alt="Overview of skálholt"/> */}
          <p className={s.text}>{paragraphs[2]}</p>
        </div>
        <div className={s.section}>
          <p className={s.text}>{paragraphs[3]}</p>
        </div>
        <div className={s.section}>
          <p className={s.text}>{paragraphs[4]}</p>
        </div>


      </div>
    )
  }

  return null;
}



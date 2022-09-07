import s from './about.module.scss';

import { useEffect, useState } from 'react';

/**
 * the about text
 * @returns the veiw for the About text
 */
export function About() {
  // state to keep track of the paragraphs in the text
  const [paragraphs, setParagraphs] = useState(null);

  // runs when the page loads
  // fetches the about text from the puplic folder, splits it into
  // paragraphs and puts it into the paragraphs state
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

  // if the paragraphs have been fetch'ed then display them
  if (paragraphs) {
    return (
      <div className={s.about}>
        <h2 className={s.title}>{"About the project"}</h2>
        <div className={s.section}>
          <p className={s.text}>{paragraphs[0]}</p>
        </div>
        <hr></hr>
        <div className={s.section}>
          <p className={s.text}>{paragraphs[1]}</p>
        </div>
        <hr></hr>
        <div className={s.section}>
          <p className={s.text}>{paragraphs[2]}</p>
        </div>
        <hr></hr>
        <div className={s.section}>
          <p className={s.text}>{paragraphs[3]}</p>
        </div>
        <hr></hr>
        <div className={s.section}>
          <p className={s.text}>{paragraphs[4]}</p>
        </div>

      </div>
    )
  }

  return null;
}



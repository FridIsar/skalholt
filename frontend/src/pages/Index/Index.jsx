import s from './index.module.scss';
import paragraphsData from '../../Utils/front-page-about';

import { Navigation } from '../../components/Navigation/Navigation'
import { IndexImage } from '../../components/IndexImage/IndexImage';
import { About } from '../../components/About/About';
import { AllowCookies } from '../../components/AllowCookies/AllowCookies';

import { useEffect, useState } from 'react';

export function Index() {
    // state to keep track of the paragraphs in the text
    const [paragraphs, setParagraphs] = useState(null);
    const [paragraphsObject, setparagraphsObject] = useState(paragraphsData.paragraphs);


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
  
  if (paragraphs) { 
    return (
      <div className={s.page}>
        <AllowCookies/>
        <Navigation onHome={true}/>
  
        {/* <div id="content" className={s.page__about}>
          <img className={s.page__about__bgImg} src={'/frontpageImg/vinnumynd.jpg'} alt="Excavations in progress"/>
          <About/>
        </div> */}
  
        {/* About section */}
        <div className={s.container} id="index-ID">
          <section className={s.section}>
            <IndexImage/>
          </section>

          {paragraphsObject.map(({ title, bigText, smallText, imgSrc }) => (
            <section key={title} className={s.section}>
              <div className={s.content}>
                <div className={s.about__texts}>
                  <div>
                    <p className={s.title}>{title} </p>
                    <h2 className={s.bigText}>{bigText} </h2>
                    <p className={s.smallText}>{smallText}</p>
                  </div>
                  
                </div>
                <img className={s.about__image} src={imgSrc} alt="Overview of skálholt"/>
              </div>
            </section>
              
          ))}
  
        </div>
      </div>
    )
  }
  return null;
}
import s from "./rawLinks.module.scss";

import { useEffect } from "react";
import { useState } from "react";
import { joinUrls } from "../../Utils/utils";
import { GenericIcon } from "../../components/GenericIcon/GenericIcon";

// backend root url
const apiUrl = process.env.REACT_APP_API_URL;

/**
 * container for the 'project data' page
 * @returns the project data page view
 */
export function RawLinks() {
  // one state for each type of backend fetch to be done
  const [groups, setGroups] = useState([]);
  const [images, setImages] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  // to keep track of the manually built tabs on this page
  const [currTab, setCurrTab] = useState('units');

  // runs when page loads
  // will fetch all relevant info from the backend and save it in the corresponnding state
  useEffect(() => {
    async function fetchLinks() {
      const url = joinUrls(apiUrl, 'csv');

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

        setGroups(json);

      }
    }

    async function fetchImages() {
      const url = joinUrls(apiUrl, 'images');

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

        setImages(json);

      }
    }

    async function fetchPDFs() {
      const url = joinUrls(apiUrl, 'pdf');

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

        setPdfs(json);

      }
    }

    fetchLinks();
    fetchImages();
    fetchPDFs();
  }, [])

  /**
   *
   * @param {String} String representing currently chosen tab
   * @returns the current tab content or an empty div if none is found
   */
  function GetContent({val}) {
    if (val === "units") return unitContent();

    if (val === "finds") return findContent();

    if (val === "archive") return archiveContent();

    return <div/>;
  }

  /**
   *
   * @returns the units tab content
   */
  function unitContent() {
    return (
      <div className={s.content}>
        {groups.map((value, index) => {
          if (value?.major_group === "units") {
            return (
              <a className={s.content__link} href={joinUrls(apiUrl, value?.href)}>
                {value?.tag}
              </a>
            )
          }
          return null;
        })}
      </div>
    )
  }

  /**
   *
   * @returns the finds tab content
   */
  function findContent() {
    return (
      <div className={s.content}>
        {groups.map((value, index) => {
          if (value?.major_group === "finds") {
            return (
              <a className={s.content__link} href={joinUrls(apiUrl, value?.href)}>
                {value?.tag}
              </a>
            )
          }
          return null;
        })}
      </div>
    )
  }

  /**
   *
   * @returns teh archive tab content
   */
  function archiveContent() {
    return (
      <div className={s.content}>
        {images.map((value, index) => {
          return <GenericIcon
            imageUrl={joinUrls(apiUrl, value?.thumbnail)}
            index={index}
            popOverElement={
              <div className={s.popOver}>
                <p className={s.popOver__text}>{value?.tag}</p>
                <p className={s.popOver__link}>View: <a href={value.href}>here</a></p>
              </div>
            }
          />
        })}
        {pdfs.map((value, index) => {
          return <GenericIcon
            imageUrl={'/util/pdfIcon.ico'}
            index={index}
            popOverElement={
              <div className={s.popOver}>
                <p className={s.popOver__text}>{value?.tag}</p>
                <p className={s.popOver__link}>View: <a href={value.href}>here</a></p>
              </div>
            }
          />
        })}
      </div>
    )
  }

  /**
   *
   * @param {Boolean} bool
   * @returns the class name for the chosen tab if true or for non chosen tabs if false
   */
  function currentTab(bool) {
    if (bool) return s.tabs__headerText__current
    return s.tabs__headerText;
  }

  // changes the currTab state in response to a event
  const handleChange = (event) => {
    setCurrTab(event.target.id);
  };

  return (

    <div className={s.tabs}>
      <div className={s.tabs__header}>
        <h2 className={currentTab(currTab === 'units')} id="units" onClick={handleChange}>Units</h2>
        <h2 className={currentTab(currTab === 'finds')} id="finds" onClick={handleChange}>Finds</h2>
        <h2 className={currentTab(currTab === 'archive')} id="archive" onClick={handleChange}>Archival data</h2>
      </div>
      <GetContent val={currTab}/>
    </div>

  );
}
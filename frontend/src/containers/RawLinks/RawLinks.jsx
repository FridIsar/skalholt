import s from "./rawLinks.module.scss";

import { Link } from "../../components/Link/Link";
import { useEffect } from "react";
import { useState } from "react";
import { joinUrls } from "../../Utils/utils";
import { GeneralList } from "../../components/GeneralList/GeneralList";
import { List } from "@material-ui/core";
import { GenericIcon } from "../../components/GenericIcon/GenericIcon";


const apiUrl = process.env.REACT_APP_API_URL;

export function RawLinks() {
  const [groups, setGroups] = useState([]);
  const [images, setImages] = useState([]);
  const [pdfs, setPdfs] = useState([]);

  const [currTab, setCurrTab] = useState('units');

  useEffect(() => {
    async function fetchLinks() {
      const url = apiUrl + 'csv';

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
      const url = apiUrl + 'images';

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
        console.log(json)

      }
    }

    async function fetchPDFs() {
      const url = apiUrl + 'pdf';

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
        console.log(json)


      }
    }

    fetchLinks();
    fetchImages();
    fetchPDFs();
  }, [])

  function GetContent({val}) {
    if (val === "units") return unitContent();

    if (val === "finds") return findContent();

    if (val === "archive") return archiveContent();

    return <div/>;
  }

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
        })}
      </div>
    )
  }

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
        })}
      </div>
    )
  }

  function archiveContent() {
    return (
      <div className={s.content}>
        {images.map((value, index) => {
          console.log(value)
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
          console.log(value)
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

  function currentTab(bool) {
    if (bool) return s.tabs__headerText__current
    return s.tabs__headerText;
  }

  const handleChange = (event) => {
    console.log(event.target.id)

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
import s from "./rawLinks.module.scss";

import { useEffect } from "react";
import { useState } from "react";
import { joinUrls, beautify } from "../../Utils/utils";
import { GenericIcon } from "../../components/GenericIcon/GenericIcon";
import Cookies from 'universal-cookie';
import { useHistory } from 'react-router-dom';

// backend root url
const apiUrl = process.env.REACT_APP_API_URL;

/**
 * container for the 'project data' page
 * @returns the project data page view
 */
export function RawLinks() {
  // one state for each type of backend fetch to be done
  const [groups, setGroups] = useState([]);   // csvs
  const [images, setImages] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [refs, setRefs] = useState([]);
  // keeps tabs on what tabs are available
  const [majorGroups, setMajorGroups] = useState([]);
  // to keep track of the manually built tabs on this page
  const [currTab, setCurrTab] = useState('');
  // keeps track of what item is goind to be deleted
  const [deleting, setDeleting] = useState(null);
  // check if user is sure
  const [areYouSure, setAreYouSure] = useState(false);
  const [userIsSure, setUserIsSure] = useState(false);

  // get the admin cookie in order to check if the user is a admin
  const cookies = new Cookies();
  const admin = cookies.get('admin');

  // history is used to navigate between pages
  const history = useHistory();

  // runs when page loads
  // will fetch all relevant info from the backend and save it in the corresponnding state
  useEffect(() => {
    async function fetchCsvs() {
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

    async function fetchRefs() {
      const url = joinUrls(apiUrl, 'references');

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

        setRefs(json);

      }
    }

    fetchCsvs();
    fetchImages();
    fetchPDFs();
    fetchRefs();
  }, [])

  // runs in many cases but only does anything when the userIsSure state is true
  // will make a delete call to the backend to delete the item in the deleting state
  useEffect(() => {
    const requestOptions = {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${admin}` },
    };

    async function requestDelete() {

      // all items have a href attribute other than references
      const isHref = deleting?.href;
      let url = '';
      if (isHref) {
        url = joinUrls(apiUrl, isHref);
      } else {
        url = joinUrls(apiUrl, 'references', deleting?.id.toString());
      }

      try {
        const result = await fetch(url, requestOptions);
        if (!result.ok) {
          throw new Error('result not ok');
        }
        await result.json();
        history.go(0);
      } catch (e) {
        return;
      }
    }

    if(userIsSure) {
      requestDelete()
    }
  }, [userIsSure, deleting, history])

  useEffect(() => {
    getMajorGroups();
  }, [groups, pdfs, images])

  function getMajorGroups() {
    const theGroups = [];

    for (var i = 0; i < groups.length; i++) {
      if (!theGroups.includes(groups[i].major_group)) {
        theGroups.push(groups[i].major_group);
      }
    }

    for (var i = 0; i < images.length; i++) {
      if (!theGroups.includes(images[i].major_group)) {
        theGroups.push(images[i].major_group);
      }
    }

    for (var i = 0; i < pdfs.length; i++) {
      if (!theGroups.includes(pdfs[i].major_group)) {
        theGroups.push(pdfs[i].major_group);
      }
    }

    setMajorGroups(theGroups.sort());
    setCurrTab(theGroups[0]);
  }

  /**
   *
   * @param {String} String representing currently chosen tab
   * @returns the current tab content or an empty div if none is found
   */
  function GetContent({ val }) {
    if (val === 'references') {
      return referenceContent();
    }

    return (
      <div className={s.content}>
        <GroupContent mGroup={val}/>
        <IconContent mGroup={val}/>
      </div>
    )
  }

  /**
   *
   * @returns the groups (links) tab content
   */
  function GroupContent({ mGroup }) {
    return (
      <div className={s.contentGroup}>
        {groups.map((value, index) => {
          if (value?.major_group === mGroup) {
            if (!admin) {
              return (
                <a className={s.contentGroup__link} href={joinUrls(apiUrl, value?.href)}>
                  {value?.tag}
                </a>
              )
            }
            return (
              <div className={s.contentGroup__admin}>
                <a className={s.contentGroup__link} href={joinUrls(apiUrl, value?.href)}>
                  {value?.tag}
                </a>
                <button id={value?.tag} className={s.button} onClick={onDelete}>Delete</button>
              </div>
            )
          }
          return null;
        })}
      </div>
    )
  }

  function IconContent({ mGroup }) {
    return (
      <div className={s.contentIcon}>
        {pdfs.map((value, index) => {
          if (value?.major_group === mGroup) {
            if (!admin) {
              return <GenericIcon
                imageUrl={'util/pdfIcon.ico'}
                index={value?.tag}
                popOverElement={
                  <div className={s.popOver}>
                    <p className={s.popOver__text}>{value?.tag}</p>
                    <p className={s.popOver__link}>View: <a href={joinUrls(apiUrl, value?.href) + "?width=600&height=600"}>here</a></p>
                  </div>
                }
              />
            }
            return (
              <div className={s.contentIcon__admin}>
                <GenericIcon
                  imageUrl={'util/pdfIcon.ico'}
                  index={value?.tag}
                  popOverElement={
                    <div className={s.popOver}>
                      <p className={s.popOver__text}>{value?.tag}</p>
                      <p className={s.popOver__link}>View: <a href={joinUrls(apiUrl, value?.href) + "?width=600&height=600"}>here</a></p>
                    </div>
                  }
                />
                <button id={value?.tag} className={s.button} onClick={onDelete}>Delete</button>
              </div>
            )
          }
        })}
        {images.map((value, index) => {
          if (value?.major_group === mGroup) {
            if (!admin) {
              return <GenericIcon
                imageUrl={joinUrls(apiUrl, value?.href) + "?width=100&height=100"}
                index={value?.tag}
                popOverElement={
                  <div className={s.popOver}>
                    <p className={s.popOver__text}>{value?.tag}</p>
                    <p className={s.popOver__link}>View: <a href={joinUrls(apiUrl, value?.href) + "?width=600&height=600"}>here</a></p>
                  </div>
                }
              />
            }
            return (
              <div className={s.contentIcon__admin}>
                <GenericIcon
                  imageUrl={joinUrls(apiUrl, value?.href) + "?width=100&height=100"}
                  index={value?.tag}
                  popOverElement={
                    <div className={s.popOver}>
                      <p className={s.popOver__text}>{value?.tag}</p>
                      <p className={s.popOver__link}>View: <a href={joinUrls(apiUrl, value?.href) + "?width=600&height=600"}>here</a></p>
                    </div>
                  }
                />
                <button id={value?.tag} className={s.button} onClick={onDelete}>Delete</button>
              </div>
            )
          }
        })}
      </div>
    )
  }

  /**
   *
   * @returns the references tab content
   */
   function referenceContent() {
    return (
      <div className={s.contentRef}>
        {refs.map((value, index) => {
          if (!admin) {
            return (
              <div className={s.ref}>
                <p className={s.ref__reference}>{value?.reference}</p>
                <p className={s.ref__desc}>{value?.description}</p>
                {value?.doi &&
                  <a classname={s.ref__doi} href={value.doi}>DOI link</a>
                }
              </div>
            )
          }
          return (
            <div className={s.contentRef__admin}>
              <div className={s.ref}>
                <p className={s.ref__reference}>{value?.reference}</p>
                <p className={s.ref__desc}>{value?.description}</p>
                {value?.doi &&
                  <a classname={s.ref__doi} href={value.doi}>DOI link</a>
                }
              </div>
              {/* I add .ref in order to be able to use the findItemByTag function later */}
              <button id={value?.id+".ref"} className={s.button} onClick={onDelete}>Delete</button>
            </div>
          )
        })}
      </div>
    )
  }

  // look through relevant data and find item
  function findItemByTag(tag) {

    const type = tag.split('.')[1];

    if (type === 'csv') return findCsvByTag(tag);

    if (type === "jpg" || type === "tif" || type === "pdf") return findArchiveByTag(tag);

    if (type === "ref") return findRefByTag(tag);

    return null;
  }

  // look through the groups state and find the csv data by tag
  function findCsvByTag(tag) {
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].tag === tag) {
        return groups[i];
      }
    }
  }

  // look through the images and pdfs state and find the archive data by tag
  function findArchiveByTag(tag) {
    let i;
    // images
    for (i = 0; i < images.length; i++) {
      if (images[i].tag === tag) {
        return images[i];
      }
    }
    // pdfs
    for (i = 0; i < pdfs.length; i++) {
      if (pdfs[i].tag === tag) {
        return pdfs[i];
      }
    }
  }

  // look through the refs state and find the reference data by tag
  function findRefByTag(tag) {

    const refId = parseInt(tag.split(".")[0]);

    for (var i = 0; i < refs.length; i++) {
      if (refs[i].id === refId) {
        return refs[i];
      }
    }
    return -1;
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

  // callback for deleting a item
  function onDelete(event) {
    const item = findItemByTag(event?.target?.id);

    setDeleting(item);
    setAreYouSure(true);
  }

  // callback for declining the delete
  function onDecline() {
    setDeleting(null);
    setAreYouSure(false);
  }

  // callback for accepting the delete
  function onAccept() {
    setUserIsSure(true);
  }

  // changes the currTab state in response to a event
  const handleChange = (event) => {
    setCurrTab(event.target.id);
  };

  return (

    <div className={s.tabs}>
      {admin &&
        <p>Add files/images/references <a href='/raw/edit'>here</a></p>
      }
      <div className={s.tabs__header}>
        {majorGroups.map((value, index) => {
          return <h2 className={currentTab(currTab === value)} id={value} onClick={handleChange}>{beautify(value)}</h2>
        })}
        <h2 className={currentTab(currTab === 'references')} id="references" onClick={handleChange}>References</h2>
      </div>
      <GetContent val={currTab}/>
      {areYouSure &&
        <div className={s.background}>
          <div className={s.card}>
            <h3 className={s.card__header}>Are you sure you want to delete </h3>
            {/* TODO some content */}
            <div className={s.card__options}>
              <button className={s.card__button} onClick={onDecline}>Decline</button>
              <button className={s.card__button} onClick={onAccept}>Accept</button>
            </div>
          </div>
        </div>
      }
    </div>

  );
}
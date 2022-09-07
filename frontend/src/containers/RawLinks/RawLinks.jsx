import s from "./rawLinks.module.scss";
import paragraphsData from '../../Utils/project-data-text';

// Material ui table:
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


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
  // loading state
  const [loading, setLoading] = useState(true);
  // error state
  const [error, setError] = useState(null);

  // get the admin cookie in order to check if the user is a admin
  const cookies = new Cookies();
  const admin = cookies.get('admin');

  // history is used to navigate between pages
  const history = useHistory();

  // Tab texts
  const [paragraphsObject, setparagraphsObject] = useState(paragraphsData.paragraphs);


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
        setError(e.toString());
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
        setError(e.toString());
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
        setError(e.toString());
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
        setError(e.toString());
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
        setError(e.toString());
        return;
      }
    }

    if(userIsSure) {
      requestDelete()
    }
  }, [userIsSure, deleting, history, admin])

  // runs when the page is loaded and goes through the relevant states to find what major groups there are (what tabs to make)
  useEffect(() => {
    function getMajorGroups() {
      const theGroups = [];

      var i;
      for (i = 0; i < groups.length; i++) {
        if (!theGroups.includes(groups[i].major_group)) {
          theGroups.push(groups[i].major_group);
        }
      }

      for (i = 0; i < images.length; i++) {
        if (!theGroups.includes(images[i].major_group)) {
          theGroups.push(images[i].major_group);
        }
      }

      for (i = 0; i < pdfs.length; i++) {
        if (!theGroups.includes(pdfs[i].major_group)) {
          theGroups.push(pdfs[i].major_group);
        }
      }

      setMajorGroups(theGroups.sort());
      setCurrTab(theGroups[0]);
      if (theGroups !== []) {
        setLoading(false);
      }
    }

    getMajorGroups();
  }, [groups, pdfs, images])



  /**
   *
   * @param {String} val representing currently chosen tab
   * @returns the current tab content or an empty div if none is found
   */
  function GetContent({ val }) {
    // if references tab:
    if (val === 'references') {
      return referenceContent();
    }
    // if other tab:
    return (
      <div className={s.content}>
        {/* <GroupContent mGroup={val}/> */}
        <IconContent mGroup={val}/>
      </div>
    )
  }

  function GetTabText({ val }) {
    if (val === 'references') {
      return (
        <div>
          <h2 className={s.bigText}>{paragraphsObject[3].bigText} </h2>
          <p className={s.smallText}>{paragraphsObject[3].smallText}</p>
        </div>
      )
    } else if (val === 'archival data') {
      return (
        <div>
          <h2 className={s.bigText}>{paragraphsObject[0].bigText} </h2>
          <p className={s.smallText}>{paragraphsObject[0].smallText}</p>
        </div>
      )
    } else if (val === 'finds') {
      return (
        <div>
          <h2 className={s.bigText}>{paragraphsObject[2].bigText} </h2>
          <p className={s.smallText}>{paragraphsObject[2].smallText}</p>
        </div>
      )
    } else if (val === 'field data') {
      return (
        <div>
          <h2 className={s.bigText}>{paragraphsObject[1].bigText} </h2>
          <p className={s.smallText}>{paragraphsObject[1].smallText}</p>
        </div>
      )
    }
    return (
      <div></div>
    )
  }

  /**
   *
   * @returns the groups (links) tab content
   */
  function GroupContent({ mGroup }) {
    console.log('groups: ', groups);
    return (
      <div className={s.contentGroup}>        
        {groups.map((value, index) => {
          if (value?.major_group === mGroup) {
            if (!admin) {
              return (
                <div>
                  <a className={s.contentGroup__link} href={joinUrls(apiUrl, value?.href)}>
                    {value?.tag}
                  </a>
                </div>
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

  /**
   *
   * @returns the images and pdfs icon tab content
   */
  // function IconContent({ mGroup }) {
  //   return (
  //     <div className={s.contentIcon}>
  //       <h1>{mGroup}</h1>
  //       {pdfs.map((value, index) => {
  //         if (value?.major_group === mGroup) {
  //           if (!admin) {
  //             return <GenericIcon
  //               imageUrl={'util/pdfIcon.ico'}
  //               index={value?.tag}
  //               popOverElement={
  //                 <div className={s.popOver}>
  //                   <p className={s.popOver__text}>{value?.tag}</p>
  //                   <p className={s.popOver__link}>View: <a href={joinUrls(apiUrl, value?.href) + "?width=600&height=600"}>here</a></p>
  //                 </div>
  //               }
  //             />
  //           }
  //           return (
  //             <div className={s.contentIcon__admin}>
  //               <GenericIcon
  //                 imageUrl={'util/pdfIcon.ico'}
  //                 index={value?.tag}
  //                 popOverElement={
  //                   <div className={s.popOver}>
  //                     <p className={s.popOver__text}>{value?.tag}</p>
  //                     <p className={s.popOver__link}>View: <a href={joinUrls(apiUrl, value?.href) + "?width=600&height=600"}>here</a></p>
  //                   </div>
  //                 }
  //               />
  //               <button id={value?.tag} className={s.button} onClick={onDelete}>Delete</button>
  //             </div>
  //           )
  //         }
  //         return null;
  //       })}
  //       {images.map((value, index) => {
  //         if (value?.major_group === mGroup) {
  //           if (!admin) {
  //             return <GenericIcon
  //               imageUrl={joinUrls(apiUrl, value?.href) + "?width=100&height=100"}
  //               index={value?.tag}
  //               popOverElement={
  //                 <div className={s.popOver} key={index}>
  //                   <p className={s.popOver__text}>{value?.tag}</p>
  //                   <p className={s.popOver__link}>View: <a href={joinUrls(apiUrl, value?.href) + "?width=600&height=600"}>here</a></p>
  //                 </div>
  //               }
  //             />
  //           }
  //           return (
  //             <div className={s.contentIcon__admin}>
  //               <GenericIcon
  //                 imageUrl={joinUrls(apiUrl, value?.href) + "?width=100&height=100"}
  //                 index={value?.tag}
  //                 popOverElement={
  //                   <div className={s.popOver}>
  //                     <p className={s.popOver__text}>{value?.tag}</p>
  //                     <p className={s.popOver__link}>View: <a href={joinUrls(apiUrl, value?.href) + "?width=600&height=600"}>here</a></p>
  //                   </div>
  //                 }
  //               />
  //               <button id={value?.tag} className={s.button} onClick={onDelete}>Delete</button>
  //             </div>
  //           )
  //         }
  //         return null;
  //       })}
  //     </div>
  //   )
  // }

  function IconContent({ mGroup }) {
    console.log('images: ', images);
    return (
      <div className={s.contentIcon}>
        <h1>{mGroup}</h1>

        {/* TABLE */}
        <div className="container">
          <TableContainer id="tableContainerID" className={s.data_table} component={Paper}>
            <Table aria-label="simple table">
              <TableHead className={s.data_table_header}>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">File type</TableCell>
                  <TableCell align="right">Open/Download</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>

              {/* PDFS */}
              {pdfs.map((value, index) => {
                if (value?.major_group === mGroup) {
                  // Not admin
                  if (!admin) {
                    return <GenericIcon
                      imageUrl={'util/pdfIcon.ico'}
                      index={value?.tag}
                      dataHref={joinUrls(apiUrl, value?.href) + "?width=600&height=600"}
                      dataType={'PDF'}
                      dataYear={value?.tag}
                      popOverElement={
                        <div className={s.popOver}>
                          <h1>PDS</h1>
                          <p className={s.popOver__text}>{value?.tag}</p>
                          <p className={s.popOver__link}>View: <a href={joinUrls(apiUrl, value?.href) + "?width=600&height=600"}>here</a></p>
                        </div>
                      }
                    />
                  }
                  // Admin
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
                return null;
              })}

              {/* IMAGES */}
              {images.map((value, index) => {
                if (value?.major_group === mGroup) {
                  // NOT ADMIN
                  if (!admin) {
                    return <GenericIcon
                      imageUrl={'util/pdfIcon.ico'}
                      index={value?.tag}
                      dataType={'IMAGE'}
                      dataHref={joinUrls(apiUrl, value?.href) + "?width=600&height=600"}
                      dataYear={value?.tag}
                      popOverElement={
                        <div className={s.popOver}>
                          <h1>PDS</h1>
                          <p className={s.popOver__text}>{value?.tag}</p>
                          <p className={s.popOver__link}>View: <a href={joinUrls(apiUrl, value?.href) + "?width=600&height=600"}>here</a></p>
                        </div>
                      }
                    />

                  } return (
                    <div>ADMIN IMG</div>
                  )
                }
                return null;
              })}

               {/* GROUPS */}
               {groups.map((value, index) => {
                if (value?.major_group === mGroup) {
                  // NOT ADMIN
                  if (!admin) {
                    return <GenericIcon
                      imageUrl={'util/pdfIcon.ico'}
                      index={value?.tag}
                      dataType={'CVS'}
                      dataHref={joinUrls(apiUrl, value?.href) + "?width=600&height=600"}
                      dataYear={value?.tag}
                      popOverElement={
                        <div className={s.popOver}>
                          <h1>PDS</h1>
                          <p className={s.popOver__text}>{value?.tag}</p>
                          <p className={s.popOver__link}>View: <a href={joinUrls(apiUrl, value?.href) + "?width=600&height=600"}>here</a></p>
                        </div>
                      }
                    />

                  } return (
                    <div>ADMIN IMG</div>
                  )
                }
                return null;
              })}


              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* --- PDFS --- */}
        {/* {pdfs.map((value, index) => {
          if (value?.major_group === mGroup) {
            if (!admin) {
              return <GenericIcon
                imageUrl={'util/pdfIcon.ico'}
                index={value?.tag}
                popOverElement={
                  <div className={s.popOver}>
                    <h1>PDS</h1>
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
          return null;
        })} */}

        {/* --- IMAGES OLD ---- */}
        {/* {images.map((value, index) => {
          if (value?.major_group === mGroup) {
            // NOT ADMIN
            if (!admin) {
              return <div> HELLO</div>
              
              // <GenericIcon
              //   imageUrl={joinUrls(apiUrl, value?.href) + "?width=100&height=100"}
              //   index={value?.tag}
              //   popOverElement={
              //     <div className={s.popOver} key={index}>
              //        <h1>IMAGES NOT ADMIN</h1>
              //       <p className={s.popOver__text}>{value?.tag}</p>
              //       <p className={s.popOver__link}>View: <a href={joinUrls(apiUrl, value?.href) + "?width=600&height=600"}>here</a></p>
              //     </div>
              //   }
              // />
            }
            // ADMIN
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
          return null;
        })} */}
      </div>
    )
  }

  /**
   *
   * @returns the references tab content
   */
   function referenceContent() {
    return (
      <div className={s.contentRef} >
        <img src='/frontpageImg/Skalholt_cover3.png' className={s.cover_img} alt="Overview of skálholt"/>
         <h1>References</h1>
        {refs.map((value, index) => {
          if (!admin) {
            return (
              <div className={s.ref}>
                {value?.doi &&
                <p className={s.ref__reference}>{value?.reference + " "}
                  <a classname={s.ref__doi} href={value.doi}>Doi</a>
                </p>
                }
                {!value?.doi &&
                <p className={s.ref__reference}>{value?.reference}</p>
                }
                <p className={s.ref__desc}>{value?.description}</p>
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

  if (error) {
    return (
      <p>{error}</p>
    )
  }

  if (loading) {
    return (
      <img src='/util/loading.webp' alt='loading gif'/>
    )
  }

  return (
    <div>
      <div className={s.divided_layout}>
        {/* LEFT */}
        <div className={s.left_column}>
        {/* ---- Tabs header ---- */}
        {admin &&
            <p>Add files/images/references <a href='/raw/edit'>here</a></p>
        }
          <div className={s.tabs__header}>
            {majorGroups.map((value, index) => {
              return <h2 className={currentTab(currTab === value)} id={value} onClick={handleChange}>{beautify(value)}</h2>
            })}
            <h2 className={currentTab(currTab === 'references')} id="references" onClick={handleChange}>References</h2>
          </div>

          {/* ---- Tab text ---- */}
          <GetTabText val={currTab}/>
          {/* {(currTab === 'references') ? <img src='/frontpageImg/Skalholt_cover2.png' className={s.cover_img} alt="Overview of skálholt"/>
 : <br></br>} */}
        </div>

        {/* RIGHT */}
        <div className={s.right_column}>
            {/* --- Content -- - */}
            {/* {(currTab === 'references') ? <img src='/frontpageImg/Skalholt_cover2.png' className={s.cover_img} alt="Overview of skálholt"/>
            : <br></br>} */}
            <GetContent val={currTab}/>

            {/* Delete stuff */}
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
      </div>
{/* GAMALT */}
    {/* <div className={s.tabs}>
        {admin &&
          <p>Add files/images/references <a href='/raw/edit'>here</a></p>
        } */}
        {/* ---- Tabs header ---- */}
        {/* <div className={s.tabs__header}>
          {majorGroups.map((value, index) => {
            return <h2 className={currentTab(currTab === value)} id={value} onClick={handleChange}>{beautify(value)}</h2>
          })}
          <h2 className={currentTab(currTab === 'references')} id="references" onClick={handleChange}>References</h2>
        </div> */}

          {/* Tab text */}
          {/* <GetTabText val={currTab}/> */}

          {/* --- Content -- - */}
          {/* <GetContent val={currTab}/> */}

          {/* Delete stuff */}
          {/* {areYouSure &&
            <div className={s.background}>
              <div className={s.card}>
                <h3 className={s.card__header}>Are you sure you want to delete </h3> */}
                {/* TODO some content */}
                {/* <div className={s.card__options}>
                  <button className={s.card__button} onClick={onDecline}>Decline</button>
                  <button className={s.card__button} onClick={onAccept}>Accept</button>
                </div>
              </div>
            </div>
          }
      </div> */}
  </div>
  );
}
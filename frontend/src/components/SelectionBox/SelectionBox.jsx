import s from './selectionBox.module.scss';

import { useState } from 'react';
import { FindsIcon } from '../FindsIcon/FindsIcon';
import { joinUrls } from '../../Utils/utils';
import { useEffect } from 'react';

// backend root url
const apiUrl = process.env.REACT_APP_API_URL;

/**
 *
 * @param {*} param0
 * @returns
 */
export function SelectionBox({ title, items, current, setCurrent, setOnClick }) {
  // list of data for finds icons if relevant
  const [iconData, setIconData] = useState(null);
  // if error while loading
  const [error, setError] = useState(null);

  // callback for when hovering, different depending on if findsicons or buildings
  function onEnter(event) {
    let object;
    if(event?.target?.attributes?.id?.value) {
      object = event?.target?.attributes?.id?.value;
    } else {
      object = event?.target?.innerText;
    }
    setCurrent(object)
  }

  // callback for when you stop hovering
  function onLeave(event) {
    setCurrent(null);
  }

  // callback for onclisk if buildings
  function onClick(event) {
    setOnClick(event?.target?.attributes?.id?.value);
  }

  // used to get relevant information from IconData state if its for finds
  function getIconDataOf(_fgroup) {
    for (let i = 0; i < iconData?.length; i++) {
      if ((iconData[i]?.tag).split('.')[0] === _fgroup) {
        return iconData[i];
      }
    }
    return null;
  }

  // runs when page loads
  // gets finds information from backend and stores it in the iconData state
  useEffect(() => {
    async function fetchDownloadData() {
      let data;
      const url = joinUrls(apiUrl, "csv");

      try {
        const result = await fetch(url);
        if (!result.ok) {
          throw new Error('result not ok');
        }
        data = await result.json();
      } catch (e) {
        setError("could not get icon data", e.toString());
        return;
      } finally {
        setIconData(data);
      }
    }
    fetchDownloadData();
  }, []);

  if (error) {
    return (
      <p>{error}</p>
    )
  }

  // if items where provided
  if (items) {
    // if finds is a property of items (means we will be redering the findsIcons)
    if (items?.finds) {
      return (
        <div className={s.selectionBox}>
          <div className={s.selectionBox__sections}>
            <h2 className={s.title}>Finds</h2>
            <div className={s.selectionBox__buttons__icons}>
              {items.finds.map((value, index) => {
                return <FindsIcon fGroup={value?.f_group}
                  fragments={value?.fragments}
                  index={index}
                  iconData={getIconDataOf(value?.f_group)}
                />
              })}
            </div>
          </div>
        </div>
      )
    } else {  // else (render buildings)
      return (
        <div className={s.selectionBox}>
          <h2 className={s.title}>{title}</h2>
          <div className={s.selectionBox__buttons__buildings}>
            {items.map((value, index) => {
              if (String(current) === String(value.id)) {
                return (
                  <button className={s.selectionBox__button__hovering}
                    id={value.id}
                    key={index}
                    onMouseEnter={onEnter}
                    onMouseLeave={onLeave}
                    onClick={onClick}
                  >
                    {value.en}
                  </button>
                )
              };
              return (
                <button className={s.selectionBox__button}
                  id={value.id}
                  key={index}
                  onMouseEnter={onEnter}
                  onMouseLeave={onLeave}
                  onClick={onClick}
                >
                  {value.en}
                </button>
              )
            })}
          </div>
        </div>
      )
    }
  }
  // else (render nothing)
  return null;
}
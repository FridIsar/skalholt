import s from './selectionBox.module.scss';

import { useState } from 'react';
import { FindsIcon } from '../FindsIcon/FindsIcon';
import { joinUrls } from '../../Utils/utils';
import { useEffect } from 'react';

export function SelectionBox({ title, items, current, setCurrent, setOnClick }) {

  const [iconData, setIconData] = useState(null);
  const [error, setError] = useState(null);

  function onEnter(event) {
    let object;
    if(event?.target?.attributes?.id?.value) {
      object = event?.target?.attributes?.id?.value;
    } else {
      object = event?.target?.innerText;
    }
    setCurrent(object)
  }

  function onLeave(event) {
    setCurrent(null);
  }

  function onClick(event) {
    console.log(event);
    if (event?.target?.attributes?.id?.value) {
      setOnClick(event.target.attributes.id.value);
    } else {
      setOnClick(event?.target?.innerText.split(' ')[0]);
    }
  }

  // function onIconClick(event) {
  //   console.log(event);
  //   const clicked = event?.target?.attributes?.id?.value
  //   if (clicked) {
  //     console.log(clicked)
  //   }
  // }

  function getIconDataOf(_fgroup) {
    for (let i = 0; i < iconData?.length; i++) {
      if ((iconData[i]?.tag).split('.')[0] === _fgroup) {
        return iconData[i];
      }
    }
    return null;
  }

  useEffect(() => {
    async function fetchDownloadData() {
      let data;
      const url = joinUrls(process.env.REACT_APP_API_URL+"files");

      try {
        const result = await fetch(url);
        if (!result.ok) {
          throw new Error('result not ok');
        }
        data = await result.json();
      } catch (e) {
        setError("could not get icon data")
        return;
      } finally {
        setIconData(data);
      }
    }
    fetchDownloadData();
  }, []);

  if (items) {
    if (items?.finds) {
      return (
        <div className={s.selectionBox}>
          <div className={s.selectionBox__sections}>
            <h2 className={s.title}>Finds</h2>
            <div className={s.selectionBox__buttons}>
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
    } else {
      return (
        <div className={s.selectionBox}>
          <h2 className={s.title}>{title}</h2>
          <div className={s.selectionBox__buttons}>
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
  return null;
}
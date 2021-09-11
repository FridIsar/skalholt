import { List } from '@material-ui/core';
import s from './selectionBox.module.scss';



export function SelectionBox({ title, items, current, setCurrent, setOnClick }) {

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

  if (items) {
    if (items?.features && items?.finds) {
      return (
        <div className={s.selectionBox}>
          <div className={s.selectionBox__sections}>
            <h2 className={s.title}>Features</h2>
            <div className={s.selectionBox__buttons}>
              {items.features.map((value, index) => {
                {console.log(value);}
                return (
                  <button className={s.selectionBox__button}
                    id={value?.type}
                    key={index}
                    onMouseEnter={onEnter}
                    onMouseLeave={onLeave}
                    onClick={onClick}
                  >
                    {`${value?.type} x ${value?.units}`}
                  </button>
                )
              })}
            </div>
            <div className={s.selectionBox__seperator}/>
            <h2 className={s.title}>Finds</h2>
            <div className={s.selectionBox__buttons}>
              {items.finds.map((value, index) => {
                {console.log(value);}
                return (
                  <button className={s.selectionBox__button}
                    id={value?.f_group}
                    key={index}
                  >
                    {`${value?.f_group} x ${value?.fragments}`}
                  </button>
                )
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
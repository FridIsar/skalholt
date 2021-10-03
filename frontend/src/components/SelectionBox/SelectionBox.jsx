import { FindsIcon } from '../FindsIcon/FindsIcon';
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

  function onIconClick(event) {
    console.log(event);
    const clicked = event?.target?.attributes?.id?.value
    if (clicked) {
      console.log(clicked)
    }
  }

  if (items) {
    if (items?.features && items?.finds) {
      return (
        <div className={s.selectionBox}>
          <div className={s.selectionBox__sections}>
            <h2 className={s.title}>Finds</h2>
            <div className={s.selectionBox__buttons}>
              {items.finds.map((value, index) => {
                return <FindsIcon fGroup={value?.f_group}
                  fragments={value?.fragments}
                  index={index}
                  onClick={onIconClick}
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
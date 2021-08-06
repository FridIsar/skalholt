import s from './mapSidebar.module.scss';

export function MapSidebar({ items, current, setCurrent, setOnClick }) {

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
    if (event?.target?.attributes?.id?.value) {
      setOnClick(event.target.attributes.id.value);
    } else {
      setOnClick(event?.target?.innerText.split(' ')[0]);
    }
  }

  if (items) {
    const keys = Object.keys(items);
    let list = [];

    for (let i = 0; i < keys.length; i++) {
      if (items[keys[i]]?.length) {
        list.push(keys[i] + ` x${items[keys[i]].length}`);
      } else {
        if (items[keys[i]].id) {
          list.push(items[keys[i]])
        } else {
          list.push(keys[i]);
        }
      }
    }
    return (
      <ul className={s.sidebar}>
        {list.map((value, index) => {
          if (value.en) {
            if (value.id.toString() === current) {
              return (
                  <li
                    className={s.sidebar__contents__highlighted}
                    id={value.id}
                    key={index}
                    onMouseEnter={onEnter}
                    onMouseLeave={onLeave}
                    onClick={onClick}
                  >
                    {value.en}
                  </li>
              )
            }
            return (
              <li
                className={s.sidebar__contents}
                id={value.id}
                key={index}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
                onClick={onClick}
              >
                {value.en}
              </li>
            )
          } else {
            if (value === current) {
              return (
                  <li
                    className={s.sidebar__contents__highlighted}
                    id={value}
                    key={index}
                    onMouseEnter={onEnter}
                    onMouseLeave={onLeave}
                    onClick={onClick}
                  >
                    {value}
                  </li>
              )
            }
            return (
              <li
                className={s.sidebar__contents}
                id={value}
                key={index}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
                onClick={onClick}
              >
                {value}
              </li>
            )
          }
        })}
      </ul>
    );
  } else {
    return null;
  }
}
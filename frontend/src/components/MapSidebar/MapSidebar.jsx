import s from './mapSidebar.module.scss';



export function MapSidebar({ list, current, setCurrent }) {



  if (list !== []) {
    return (
      <ul className={s.sidebar}>
        {list.map((value, index) => {
          return (
            <li
              className={s.sidebar__contents}
              id={value.id}
              key={index}
              onClick={(event) => {
                setCurrent(event.target.attributes.id.value)
              }}
            >
              {value.engName}
            </li>
          )
        })}
      </ul>
    );
  } else {
    return null;
  }
}
import s from './mapSidebar.module.scss';



export function MapSidebar({ list, current, setCurrent, setOneBuilding, setBuildingId }) {


  function onEnter(event) {
    const object = event.target.attributes.id.value;
    setCurrent(object)
  }

  function onLeave(event) {
    setCurrent(null);
  }

  function onClick(event) {
    setBuildingId(event?.target?.attributes?.id?.value);
    setOneBuilding(true);
    console.log(typeof(event?.target?.attributes?.id?.value));
    console.log(typeof(event?.target?.attributes?.id?.value?.toString()))
  }


  if (list !== []) {
    return (
      <ul className={s.sidebar}>
        {list.map((value, index) => {
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
                  {value.engName}
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
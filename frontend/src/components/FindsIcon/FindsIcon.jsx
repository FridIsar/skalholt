import s from './FindsIcon.module.scss';

export function FindsIcon({fGroup, fragments, index, onClick}) {

  //background image
  var bImage = {backgroundImage: `url(/findsIcons/${fGroup}.jpg)`}

  return (
    <div className={s.iconWrapper}>
      <button className={s.icon}
        id={fGroup}
        key={index}
        onClick={onClick}
        style={bImage}
      />
      <p className={s.icon__units}>
        {"x" + fragments}
      </p>
    </div>
  )

}
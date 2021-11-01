import s from './map.module.scss';

import { VectorMap } from '@south-paw/react-vector-maps';
import { joinUrls } from '../../Utils/utils';

// backend root url
const apiUrl = process.env.REACT_APP_API_URL;

// takes JSON and returns new JSON that the vectormap component can use
function makeMapJson(data) {
    const viewBox = "0 0 111.985 71.657";
    for(let i = 0; i < data.length; i++) {
      data[i]['name'] = data[i]['id'];
    }
    const JSONmap = {"id":"map", "name":"map", "viewBox":viewBox, "layers":data};
    return JSONmap;
}

/**
 * Interactable map
 *
 * all params are props
 * @param data JSON with the map tracings
 * @param background String url for the backgroun image
 * @param year Integer the current year
 * @param expanded Boolean is the map expanded
 * @param setExpanded callback taht changes the expanded prop in parent
 * @param current currently hovered path in the map
 * @param setCurrent callback to set the hovered path in parent
 * @param setOnClick callback that handles what happends when path is clicked
 * @param loading Boolean taht lets know if the map info has been loaded
 * @param error error that lets know if a error happend while loading the map info
 * @returns an interactable map
 */
export function Map({ data,
                      background,
                      year=null,
                      expanded,
                      setExpanded,
                      current,
                      setCurrent,
                      setOnClick,
                      loading,
                      error }) {

  // props to be passed to the vectormap component
  const layerProps = {
    onClick: ({ target }) => setOnClick(target.attributes.id.value),
    onMouseEnter: ({ target }) => setCurrent(target.attributes.id.value),
    onMouseLeave: ({ target }) => setCurrent('None'),
  };

  // expand and shrink functions
  function expandNshrink() {
    setExpanded(!expanded);
  }

  // if an error happend
  if (error) {
    return (
      <p className={s.error}>Error: {error}</p>
    );
  }

  // if loading
  if (loading) {
    return (
      <p className={s.loading}>Loading...</p>
    );
  }

  // if all ok
  return (
    <div className={s.mapContainer}>
      {year &&
        <div className={s.mapHeader}>
          <h5 className={s.mapHeader__year}>{year}</h5>
          {!expanded &&
            <button className={s.mapHeader__expandShrink}
            onClick={expandNshrink}>
              Expand
            </button>
          }
          {expanded &&
            <button className={s.mapHeader__expandShrink}
            onClick={expandNshrink}>
              Shrink
            </button>
          }
        </div>
      }
      <div className={s.map}>
      {background &&
        <img alt='map details' src={joinUrls(apiUrl, background)} className={s.image}/>
      }
        <div>
          <VectorMap {...makeMapJson(data)} layerProps={layerProps} currentLayers={[parseInt(current)]} />
        </div>
      </div>
    </div>
  )
}
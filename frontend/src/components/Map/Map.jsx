import s from './map.module.scss';

import { VectorMap } from '@south-paw/react-vector-maps';
import { joinUrls } from '../../Utils/utils';


const apiUrl = process.env.REACT_APP_API_URL;

function makeMapJson(data) {
  if (data?.finds) {
    //TODO: when finds is finalised in backend
    let layers = [];
    const viewBox = "0 0 111.985 71.657"; // unknown using previous for now
    let finds = data.finds;
    for(let i = 0; i < finds?.length; i++) {
      for(let j = 0; j < finds[i]; j++) {
        layers[i]['id'] = finds[i]['id'];
        layers[i]['name'] = finds[i]['id'];
        layers[i]['d'] = finds[i]['path']; // unknown
        // can change if backend changes
      }
    }
    const JSONmap = {"id":"map", "name":"map", "viewBox":viewBox, "layers":layers};
    return JSONmap;
  } else {
    const viewBox = "0 0 111.985 71.657";
    for(let i = 0; i < data.length; i++) {
      data[i]['name'] = data[i]['id'];
    }
    const JSONmap = {"id":"map", "name":"map", "viewBox":viewBox, "layers":data};
    return JSONmap;
  }
}

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

  const layerProps = {
    onClick: ({ target }) => setOnClick(target.attributes.id.value),
    onMouseEnter: ({ target }) => setCurrent(target.attributes.id.value),
    onMouseLeave: ({ target }) => setCurrent('None'),
  };

  function expand_() {
    setExpanded(true);
  }

  function shrink_() {
    setExpanded(false);
  }

  if (error) {
    return (
      <p className={s.error}>Error: {error}</p>
    );
  }

  if (loading) {
    return (
      <p className={s.loading}>Loading...</p>
    );
  }

  return (
    <div className={s.mapContainer}>
      {year &&
        <div className={s.mapHeader}>
          <h5 className={s.mapHeader__year}>{year}</h5>
          {!expanded &&
            <button className={s.mapHeader__expandShrink}
            onClick={expand_}>
              Expand
            </button>
          }
          {expanded &&
            <button className={s.mapHeader__expandShrink}
            onClick={shrink_}>
              Shrink
            </button>
          }
        </div>
      }
      <div className={s.map}>
      {background &&
        <img alt='map details' src={joinUrls(apiUrl, background)} className={s.image}/>
      }
      {!background &&
        <img alt='map details' src={joinUrls(apiUrl, data.image)} className={s.image}/>
      }
        <div>
          <VectorMap {...makeMapJson(data)} layerProps={layerProps} currentLayers={[parseInt(current)]} />
        </div>
      </div>
    </div>
  )
}
import s from './oneBuilding.module.scss';

import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
import { Description } from '../../components/Description/Description';
import { SelectionBox } from '../../components/SelectionBox/SelectionBox';
import { joinUrls } from '../../Utils/utils';

// backend root url
const apiUrl = process.env.REACT_APP_API_URL;

/**
 * container for a single building overview.
 * @returns the view of one building and its relevant data
 */
export function OneBuilding() {
  // error state if any
  const [error, setError] = useState(null);
  // loading state
  const [loading, setLoading] = useState(true);
  // currently selected interactable
  const [current, setCurrent] = useState(null);
  // data for this building
  const [data, setData] = useState(null);
  // is the description limited
  const [limited, setLimited] = useState(true);

  // get id and year from params
  const { idNyear } = useParams();
  const split = idNyear.split('-');
  const buildingId = split[0];
  const year = split[1];

  // runs when page loads
  // gets building information from backend and sets it in the data state
  useEffect(() => {
    async function fetchBuilding() {
      let json;
      const url = joinUrls(apiUrl+"years/", year, "/buildings/", buildingId);

      try {
        const result = await fetch(url);
        if (!result.ok) {
          throw new Error('result not ok');
        }
        json = await result.json();
      } catch (e) {
        setError("could not get building information", e.toString())
        return;
      } finally {
        setData(json);
        setLoading(false);
      }
    }
    fetchBuilding();
  },[])

  if (error) {
    return (
      <p>{error}</p>
    )
  }

  if (loading) {
    return (
      <img src='/util/loading.webp' alt='loading gif'/>
    )
  }

  return (
    <div className={s.container}>
      <h2 className={s.building__header}>{data?.en + '/' + data?.is + ' - ' + year}</h2>
      <a href={'/interactive'}>Back to interactive map</a>
      <Description description={data?.description}
        year={year}
        buildingId={buildingId}
        limit={300}
        limited={limited}
        setLimited={setLimited}/>
      {!(data?.image === null) &&
        <div className={s.mapContainer}>
          <img src={joinUrls(apiUrl, data?.image)}
            alt={'Topdown map of ' + data?.en + '/' + data?.is}
            className={s.mapImage}/>
        </div>
      }
      <SelectionBox items={data}
        current={current}
        setCurrent={setCurrent}
        setOnClick={(string) => (string)}/>
      <a href={'/interactive'}>Back to interactive map</a>
    </div>
  );
}
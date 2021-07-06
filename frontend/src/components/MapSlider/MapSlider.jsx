

import { useEffect, useState } from 'react';
import ReactSlider from 'react-slider';

const apiUrl = process.env.REACT_APP_API_URL;

export function MapSlider({ updateYear, year }) {
  const [allyears, setAllyears] = useState([]);

  useEffect(() => {
    async function fetchYears() {
      console.log("in fetchyears")

      let json;

      const url = apiUrl+"years/";

      try {
        const result = await fetch(url);

        if (!result.ok) {
          throw new Error('result not ok');
        }

        json = await result.json();
        console.log(json);
      } catch (e) {
        return;
      } finally {
        updateYear(json[0]);
      }
    }
    if (allyears === []) {
      fetchYears();
    }
  }, [allyears]);



  return null;
}





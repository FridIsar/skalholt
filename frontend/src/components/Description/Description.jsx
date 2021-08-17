import s from './description.module.scss';

import { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { joinUrls } from '../../Utils/utils';
import { useHistory } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

export function Description({ description, limit, year, buildingId }) {
  const [limited, setLimited] = useState(true);
  const [submited, setSubmited] = useState(false);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState(null);

  const cookies = new Cookies();
  const admin = cookies.get('admin');

  const history = useHistory();

  if (!limit) {
    setLimited(false);
  }

  const onSeeMoreOrLess = () => {
    setLimited(!limited);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmited(true);
  }

  function validateForm() {
    return !(description === editText);
  }

  function textChanged(event) {
    setEditText(event.target.value)
  }

  useEffect(() => {
    setEditText(description);
  }, [description])

  useEffect(() => {
    const requestOptions = {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${admin}` },
      body: JSON.stringify({ description: editText })
    };

    async function requestEdit() {
      let url = '';
      if(buildingId) {
        url = joinUrls(apiUrl, `/years/${year}`, `/buildings/${buildingId}`);
      } else {
        url = joinUrls(apiUrl, `/years/${year}`);
      }

      try {
        const result = await fetch(url, requestOptions);
        if (!result.ok) {
          throw new Error('result not ok');
        }
        await result.json();
        history.go(0);
      } catch (e) {
        setError(e);
        return;
      }
    }

    if(submited) {
      requestEdit()
    }
  }, [submited, admin, buildingId, editText, history, year])

  if(error) {
    return <p>Error: could not submit change</p>
  }

  if (!admin) {
    return (
      <div className={s.description}>
        {limited &&
          <p className={s.description__text} >{description?.substring(0, limit)+"..."}</p>
        }
        {!limited &&
          <p className={s.description__text} >{description}</p>
        }
        {(limited && limit) &&
          <button className={s.description__link} onClick={onSeeMoreOrLess}>See more.</button>
        }
        {(!limited && limit) &&
          <button className={s.description__link} onClick={onSeeMoreOrLess}>See less.</button>
        }
      </div>
    )
  }

  return (
    <div className={s.description}>
      <Form onSubmit={handleSubmit}>
        <Form.Group className={s.description__text} controlId="description">
          <Form.Control as="textarea"
            className={s.description__inputText}
            value={editText}
            onChange={textChanged}/>
        </Form.Group>
        <Button block size="lg"
          type="submit"
          className={s.submitBtn}
          disabled={!validateForm()}>
          Submit change
        </Button>
      </Form>
    </div>
  )
}
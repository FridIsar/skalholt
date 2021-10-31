import s from "./addRawForm.module.scss";

import { Form } from "react-bootstrap";
import { useState, useEffect } from 'react';
import Button from "react-bootstrap/Button";
import { useHistory } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { joinUrls } from "../../Utils/utils";

// backend root url
const apiUrl = process.env.REACT_APP_API_URL;

export function AddRawForm() {
  // state that lets the component know if the form was submitted
  const [submited, setSubmited] = useState(false);
  // state to keep track of what type of data is being added to the backend
  const [type, setType] = useState('');
  // tracks file if a file is being uploaded
  const [file, setFile] = useState(null);
  // tracks reference info if reference is being uploaded
  const [ref, setRef] = useState(['','','']);
  const [validRef, setValidRef] = useState(false);
  // errors
  const [error, setError] = useState(null);

  // get the admin cookie in order to check if the user is a admin
  const cookies = new Cookies();
  const admin = cookies.get('admin');

  // history is used to navigate between pages
  const history = useHistory();

  // if not admin kick to regular project data page
  if (!admin) history.push('/raw');

  useEffect(() => {
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${admin}` }
    };
    async function request() {
      let json;
      try {
        let url = '';

        if (type === 'File') {
          let _type = file.type.split('/')[1];  // get the type of the file (pdf/webp/tiff/jpeg/vnd.ms-excel)
          console.log(_type)
          if (_type === 'pdf') url = joinUrls(apiUrl, 'pdf');   // pdf files
          if (_type === 'webp' || _type === 'jpeg' || _type === 'tiff') url = joinUrls(apiUrl, 'images');   // 3 types of images
          if (_type === 'vnd.ms-excel') url = joinUrls(apiUrl, 'csv');  // excel files (.csv)
          requestOptions['body'] = JSON.stringify({ file: file });
        }
        if (type === 'Reference') {
          url = joinUrls(apiUrl, 'references')
          requestOptions['body'] = JSON.stringify({
            reference: ref[0],
            description: ref[1],
            doi: ref[2],
          });
        }

        console.log(file)
        console.log(url)
        console.log(requestOptions)

        const result = await fetch(url, requestOptions);
        if (!result.ok) {
          throw new Error(result.statusText);
        }

        console.log(result)

      } catch (e) {
        setError(e.toString());
        return;
      }
    }
    if (submited) {
      request();
    }
  }, [submited, history]);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmited(true);
  }

  function radioClick(event) {
    const _type = event?.target?.id;
    setType(_type);
    if(_type === 'File') {
      setRef(['','','']);
      setValidRef(false);
    }
    if(_type === 'Reference') setFile(null);
  }

  function fileUpload(event) {
    setFile(event?.target?.files[0]);
  }

  function refRefUpload(event) {
    let newRef = ref;
    newRef[0] = event?.target?.value;

    setRef(newRef);
    setValidRef(ref[0] !== '' && ref[1] !== '');
  }

  function refDescUpload(event) {
    let newRef = ref;
    newRef[1] = event?.target?.value;

    setRef(newRef);
    setValidRef(ref[0] !== '' && ref[1] !== '');
  }

  function refDoiUpload(event) {
    let newRef = ref;
    newRef[2] = event?.target?.value;

    setRef(newRef);
    setValidRef(ref[0] !== '' && ref[1] !== '');
  }

  function validateForm() {
    if (type === "File" && file !== null) return true;
    if (type === "Reference" && validRef) return true;
    return false;
  }

  return (
    <div className={s.content}>
      <div className={s.form}>
        <Form onSubmit={handleSubmit}>
        <div className={s.type}>
          <Form.Check
            inline
            label="File/Pdf/Image"
            name="type"
            type='radio'
            id="File"
            className={s.type__radio}
            onClick={radioClick}
          />
          <Form.Check
            inline
            label="Reference"
            name="type"
            type='radio'
            id="Reference"
            className={s.type__radio}
            onClick={radioClick}
          />
        </div>
        {type === "File" &&
          <Form.Group controlId="formFile" className={s.fileUpload}>
            <Form.Control type="file" onChange={fileUpload}/>
          </Form.Group>
        }
        {type === "Reference" &&
          <div className={s.reference}>
            <Form.Group className={s.reference__group}
            controlId="refReference">
              <Form.Label>Reference</Form.Label>
              <Form.Control as="textarea"
                placeholder="Reference"
                className={s.reference__text}
                onChange={refRefUpload}>
              </Form.Control>
            </Form.Group>
            <Form.Group className={s.reference__group}
            controlId="refDesc">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea"
                placeholder="Description"
                className={s.reference__text}
                onChange={refDescUpload}>
              </Form.Control>
            </Form.Group>
            <Form.Group className={s.reference__group}
            controlId="refDoi">
              <Form.Label>DOI</Form.Label>
              <Form.Control as="textarea"
                placeholder="DOI"
                className={s.reference__text}
                onChange={refDoiUpload}>
              </Form.Control>
            </Form.Group>
          </div>
        }
        {type === "File" && file !== null &&
          <Button block size="lg"
            type="submit"
            className={s.submitBtn}
            disabled={!validateForm()}>
            Submit
          </Button>
        }
        {type === "Reference" && validRef &&
          <Button block size="lg"
            type="submit"
            className={s.submitBtn}
            disabled={!validateForm()}>
            Submit
          </Button>
        }
        </Form>
        {error &&
          <p className={s.error}>{error}</p>
        }
      </div>
    </div>
  );
}
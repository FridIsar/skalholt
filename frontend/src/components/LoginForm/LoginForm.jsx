import s from "./loginForm.module.scss";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import Cookies from 'universal-cookie';

// backend root url
const apiUrl = process.env.REACT_APP_API_URL;

/**
 * the login form
 * @returns the view for the login form
 */
export function LoginForm() {
  // login details
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  // submission details
  const [submited, setSubmited] = useState(false)
  // submission error
  const [error, setError] = useState(null)

  // use history to navigate pages
  const history = useHistory();

  // cannot submit untill at least one char in eash textarea
  function validateForm() {
    return userName?.length > 0 && password?.length > 0;
  }

  // callback for submissions
  function handleSubmit(event) {
    event.preventDefault();
    setSubmited(true);
  }

  // runs in many instances, but only does something if submitted is true
  // makes a post request to backend to login and saves the relevant cookie if the request is successful
  useEffect(() => {
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json' },
      body: JSON.stringify({ username: userName, password: password })
    };
    async function request() {
      let json;
      try {
        const result = await fetch(apiUrl + 'users/login', requestOptions);
        if (!result.ok) {
          throw new Error('result not ok');
        }
        json = await result.json();

        var exDate = new Date()
        exDate.setTime(exDate.getTime() + (json?.expiresIn * 1000));

        const cookies = new Cookies();
        cookies.set('admin', `${json?.token}`, { path: '/', expires: exDate });

        history.push('/');
      } catch (e) {
        setError(e);
        return;
      }
    }
    if (submited) {
      request();
    }
  }, [submited, history, password, userName]);

  return (
    <div className="Login">
      <Form onSubmit={handleSubmit}>
        <Form.Group size="lg"
          className={s.group}
          controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            autoFocus
            type="username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </Form.Group>
        <Form.Group size="lg"
          className={s.group}
          controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button block size="lg"
          type="submit"
          disabled={!validateForm()}>
          Login
        </Button>
      </Form>
      {error &&
        <p className={s.errorMsg}>Something went wrong, could not log in. {error.toString()}</p>
      }
    </div>
  )
}
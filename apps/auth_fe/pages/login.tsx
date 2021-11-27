import styles from '../styles/Login.module.scss';
import { httpPost, HttpError } from 'pinaple_www/dist/http';
import { environment } from '../common/environment';
import { PErrorMessage }  from "pinaple_components/dist";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { NextPage } from 'next';

const PROJECT = environment.appName;
const FILE = 'login.tsx';

const Login: NextPage = () => {
  const FUNC = 'Login()';
  const { register, handleSubmit, watch, formState } = useForm();
  const [errorMessage, setErrorMessage] = useState('');

  let submitForm = async (data: any) => {
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@ cp 100: submitForm()'); 
    try {
      let hres = await httpPost('/api/authenticate', {
        userName: data.userName,
        password: data.password,
      })
      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@ hres'); 
      console.dir(hres); // @@@@@@@@@@@@@@@@@@@@@@@
      setErrorMessage('');
      window.location.href = hres.redirectUri;
    } catch(err) {
      console.error('@@@@@@@@@@@@@@@@@@@@@@@@@@@ cp 100: error', err); 
      if (err instanceof HttpError) {
          setErrorMessage(err.body.data.message);
      } else {
          setErrorMessage('internal error');
      }
    }

  };

  function showError() {
    if (errorMessage === '') {
      return null;
    } else {
      return (
        <div className={styles.messageField}>
          <PErrorMessage message={errorMessage} onClose={() => setErrorMessage("")}/>
        </div>
      );
    }
  }


  return (
    <div className={styles.formContainer}>
      <h2 id="header"> Prihlásiť sa </h2>
      <div className={ styles.formField }>
        <label htmlFor="userName"> Užívateľské meno </label>
        <input
          className={formState.errors.userName ? styles.formError : ""}
          type="text"
          placeholder="Užívateľské meno"
          {...register("userName", {
            required: true,
            pattern: /^[a-zA-Z]+[a-zA-Z0-9]+$/,
          })}
        />
      </div>
      <div className={ styles.formField }>
        <label htmlFor="password"> Heslo </label>
        <input
          className={formState.errors.password ? styles.formError : ""}
          type="password"
          placeholder="Heslo"
          {...register("password", { required: true })}
        />
      </div>
      <div className={ styles.formButtonsPane }>
        <a className="btn" onClick={handleSubmit(submitForm)}>
          {" "}
          Odošli{" "}
        </a>
      </div>
      {showError()}
    </div>
  );
};

export default Login;

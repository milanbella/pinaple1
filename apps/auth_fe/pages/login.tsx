import React from 'react';
import { useForm } from 'react-hook-form';
import type { NextPage } from 'next';

import styles from '../styles/Login.module.scss';
import { httpPost, HttpError } from 'www/dist/http';

const FILE = 'login.tsx';

const Login: NextPage = () => {
  const FUNC = 'Login()';
  const { register, handleSubmit, watch, formState } = useForm();

  let submitForm = (data: any) => {
    console.dir('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ submitForm()'); //@@@@@@@@@@@@@@@@@@@
    console.log(data);
    try {
      let hres = httpPost('/api/authenticate', {
        userName: data.userName,
        password: data.password,
      })
    } catch(err) {
      if (err instanceof HttpError) {
        if (err.status === 401) {
        } else {
          console.error(`${FILE}:${FUNC}: submitForm(), calling /api/authenticate failed`, err);
        }
      } else {
          console.error(`${FILE}:${FUNC}: submitForm(), calling /api/authenticate failed`, err);
      }
    }

  };


  return (
    <div className={styles.formContainer}>
      <h2 id="header"> Login </h2>
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
    </div>
  );
};

export default Login;

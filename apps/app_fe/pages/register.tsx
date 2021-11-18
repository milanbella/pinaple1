import styles from "../styles/pages/Register.module.scss";
import { httpPost, HttpError } from "pinaple_www/dist/http";
import { PErrorMessage }  from "pinaple_components/dist";

import type { NextPage } from "next";
import Router from 'next/router'
import { useForm } from "react-hook-form";
import React from "react";
import { useState } from "react";
import { ResultKind } from './result';

const Login: NextPage = () => {
  const [count, setCount] = useState(0);
  const { register, handleSubmit, watch, formState } = useForm();
  const [errorMessage, setErrorMessage] = useState('');

  let submitForm = async (data: any) => {

    try {
      let hres = await httpPost('/api/register', {
        userName: data.userName,
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm
      });

      Router.push({
        pathname: '/result',
        query: { page: ResultKind.registrationSuccess },
      })

    } catch(err) {
      if (err instanceof HttpError) {
        setErrorMessage(err.body.data.message);
      } else {
        setErrorMessage("internal error");
      }
    }
  };

  function showError() {
    if (errorMessage === "") {
      return null;
    } else {
      return (
        <div className={styles.messageField}>
          <PErrorMessage message={errorMessage} onClose={() => setErrorMessage("")}/>
        </div>
      );
    }
  }

  function loginForm() {
    return (
      <div className={styles.formContainer}>
        <h2 id="header"> Registrácia </h2>
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
          <label htmlFor="email"> Email </label>
          <input
            className={formState.errors.email ? styles.formError : ""}
            type="text"
            placeholder="Email"
            {...register("email", {
              required: true,
              pattern: /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+$/,
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
        <div className={ styles.formField }>
          <label htmlFor="passwordConfirm"> Potvrď heslo </label>
          <input
            className={formState.errors.passwordConfirm ? styles.formError : ""}
            type="password"
            placeholder="potvrď heslo"
            {...register("passwordConfirm", { required: true })}
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
  }

  return loginForm()
};

export default Login;

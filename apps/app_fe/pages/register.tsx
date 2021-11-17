import type { NextPage } from "next";
import styles from "../styles/pages/Register.module.scss";
import { httpPost, HttpError } from "pinaple_www/dist/http";
import { PErrorMessage }  from "pinaple_components/dist";
//import PErrorMessage1  from "../components/PErrorMessage";

import { useForm } from "react-hook-form";
import React from "react";
import { useState } from "react";

const Login: NextPage = () => {
  const [count, setCount] = useState(0);
  const { register, handleSubmit, watch, formState } = useForm();
  const [errorMessage, setErrorMessage] = useState("");
  const [isUserCreated, setIsUserCreated] = useState(false);

  let submitForm = async (data: any) => {

    try {
      let hres = await httpPost('/api/register', {
        userName: data.userName,
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm
      });
      console.error('@@@@@@@@@@@@@@@@@@@@@ cp 100: sussess:', hres); 
      setIsUserCreated(true);
      setErrorMessage("user was successfully created");
    } catch(err) {
      setIsUserCreated(false);
      console.error('@@@@@@@@@@@@@@@@@@@@@ cp 200: error:', err); 
      console.dir(err); //@@@@@@@@@@@@@@@@
      if (err instanceof HttpError) {
        setErrorMessage(err.body.data.message);
      } else {
        setErrorMessage("internal error");
      }
    }
  };

  React.useEffect(() => {
    console.dir('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ errors:'); //@@@@@@@@@@@@@@@@@@@
    console.dir(formState.errors); //@@@@@@@@@@@@@@@@@@@
  }, [formState]);

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
        <PErrorMessage message="Hello from PErrorMessage!"/>
      </div>
    );
  }
  //<PErrorMessage message="Hello from PErrorMessage!"/>

  return loginForm()
};

export default Login;

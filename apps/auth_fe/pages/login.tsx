import type { NextPage } from "next";
import styles from "../styles/Login.module.scss";
import { useForm } from "react-hook-form";
import React from "react";

const Login: NextPage = () => {
  const { register, handleSubmit, watch, formState } = useForm();

  let submitForm = (data: any) => {
    console.dir('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ submitForm()'); //@@@@@@@@@@@@@@@@@@@
    console.log(data);
  };

  React.useEffect(() => {
    console.dir('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ errors:'); //@@@@@@@@@@@@@@@@@@@
    console.dir(formState.errors); //@@@@@@@@@@@@@@@@@@@
  }, [formState]);

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

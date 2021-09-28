import type { NextPage } from "next";
import Image from "next/image";
import styles from "../styles/Register.module.scss";
import { useForm } from "react-hook-form";
import React from "react";

const Home: NextPage = () => {
  const { register, handleSubmit, watch, formState } = useForm();

  let submitForm = (data: any) => {
    console.log(data);
  };

  React.useEffect(() => {
    console.dir(formState.errors.userName); //@@@@@@@@@@@@@@@@@@@
  }, [formState]);

  return (
    <div className={styles.container}>
      <h2 id="header"> Registrácia </h2>
      <form className={styles.mainForm}>
        <div className={styles.field}>
          <label htmlFor="userName"> Užívateľské meno </label>
          <input
            className={formState.errors.userName ? styles.error : ""}
            type="text"
            placeholder="Užívateľské meno"
            {...register("userName", {
              required: true,
              pattern: /^[a-zA-Z]+[a-zA-Z0-9]+$/,
            })}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="email"> Email </label>
          <input
            type="text"
            placeholder="Email"
            {...register("email", {
              required: true,
              pattern: /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+$/,
            })}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="password"> Heslo </label>
          <input
            type="password"
            placeholder="Heslo"
            {...register("password", { required: true })}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="passwordConfirm"> Potvrď heslo </label>
          <input
            type="password"
            placeholder="potvrď heslo"
            {...register("passwordConfirm", { required: true })}
          />
        </div>
        <div className={styles.buttonsPane}>
          <a className="btn" onClick={handleSubmit(submitForm)}>
            {" "}
            Odošli{" "}
          </a>
        </div>
      </form>
    </div>
  );
};

export default Home;

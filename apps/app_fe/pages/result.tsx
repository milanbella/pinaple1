import type { NextPage } from "next";
import styles from "../styles/pages/Result.module.scss";
import { useRouter } from 'next/router';

export enum ResultKind {
  registrationSuccess = 'registration_succes'
}

const RegisterResult: NextPage = () => {
  const router = useRouter();

  let rigistartionSuccess = () => {
    return (
      <div> Úspešne ste sa zaregistrovali. Môžte sa teraz prihlásť. </div>
    )
  }

  let display = () => {
    if (router.query.page === ResultKind.registrationSuccess) {
      return rigistartionSuccess();
    } else {
      return null;
    }
  }

  return (
    <div className={styles.container}>
      {display()}
    </div>
  );
};

export default RegisterResult;

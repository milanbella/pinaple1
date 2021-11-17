import type { NextPage } from 'next'
import styles from '../styles/pages/ErrorMessage.module.scss'
import PErrorMessage from '../components/PErrorMessage';

import { useState } from "react";

const ErrorMessage: NextPage = () => {
  let [isShowWasClosed, setIsShowWasClosed] = useState(false);
  let onCloseFn = () => {
    setIsShowWasClosed(true);
  }

  let showWasClosed = () => {
    if (isShowWasClosed) {
      return (
        <div> {"Message was closed!"} </div>
      )
    } else {
      return null;
    }
  }

  return (
    <div className={styles.container}>

      <div className="PErrorMessage">
        <PErrorMessage message="PErrorMessage component" onClose={onCloseFn}/>
      </div>
      
      {showWasClosed()}
    </div>
  )
}

export default ErrorMessage

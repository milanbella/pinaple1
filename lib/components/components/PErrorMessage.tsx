import styles from '../styles/components/PErrorMessage.module.scss';

import { useState } from 'react';

export interface IProps {
  message: string;
}


const PErrorMessage = (props: IProps) => {
  const [isShowing, setIsShowing] = useState(true);
  if (isShowing === true) { 
    return (
      <div className={styles.container}>
        {props.message}
        <span className={styles.closeButton} onClick={() => setIsShowing(false)}>&times;</span>
      </div>
    );
  } else {
    return (
      null
    )
  }
};

export default PErrorMessage;

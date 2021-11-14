import type { NextPage } from 'next'
import styles from '../styles/pages/ErrorMessage.module.scss'
import PErrorMessage from '../components/PErrorMessage';

const ErrorMessage: NextPage = () => {
  return (
    <div className={styles.container}>
      <PErrorMessage message="PErrorMessage component"/>
    </div>
  )
}

export default ErrorMessage

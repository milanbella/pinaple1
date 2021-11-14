import type { NextPage } from 'next';
import Link from 'next/link';
import styles from '../styles/pages/Home.module.scss'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Link href="/errorMessage">error message bla</Link>
    </div>
  )
}

export default Home

import type { NextPage } from "next";
import styles from "../styles/components/Layout.module.scss";
import Header from './Header';
import Footer from './Footer';

const Layout: NextPage = ({ children }) => {
  return (
    <div className={styles.pageContainer}>
      <Header/>
      <main>
        { children }
      </main>
      <Footer/>
    </div>
  )
};

export default Layout;

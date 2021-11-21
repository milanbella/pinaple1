import type { NextPage } from "next";
import Link from 'next/link';
import styles from "../styles/components/Header.module.scss";

const Header: NextPage = () => {

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <ul>
          <li><a href="/api/login">Prihlásiť</a></li>
          <li><Link href="/register"><a>Zaregistrovať</a></Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

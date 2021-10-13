import type { NextPage } from "next";
import styles from "../styles/components/Header.module.scss";

const Header: NextPage = () => {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <ul>
          <li><a href="#">Prihlásiť</a></li>
          <li><a href="#">Zaregistrovať</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

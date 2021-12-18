import type { NextPage } from "next";
import styles from "../styles/components/Footer.module.scss";

const Footer: NextPage = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.copyRight}>&copy; Pinaple software</div>
    </footer>
  );
};

export default Footer;

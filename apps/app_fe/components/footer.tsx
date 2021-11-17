import type { NextPage } from "next";
import styles from "../styles/components/Footer.module.scss";

const Footer: NextPage = () => {
  return (
    <footer className={styles.footer}>
      	&copy; Pinaple software
    </footer>
  );
};

export default Footer;

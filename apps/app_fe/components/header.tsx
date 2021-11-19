import type { NextPage } from "next";
import Link from 'next/link';
import styles from "../styles/components/Header.module.scss";
import { environment } from "../environment";

const Header: NextPage = () => {

  let redirectUri=`${environment.authProtocol}://${environment.authHost}:${environment.authPort}/authorize?response_type=code&client_id=${environment.oauthClientId}&redirec_uri${encodeURIComponent(environment.oauthRedirectUri)}`;
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <ul>
          <li><a href={redirectUri}>Prihlásiť</a></li>
          <li><Link href="/register"><a>Zaregistrovať</a></Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

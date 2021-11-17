import "../node_modules/pinaple_www/dist/styles/globals.scss";
import "pinaple_components/dist/main.css";
import type { AppProps } from "next/app";
import Layout from '../components/Layout'; 



function MyApp({ Component, pageProps }: AppProps) {
  return ( 
  <Layout>
    <Component {...pageProps} />
  </Layout>
  )
}
export default MyApp;

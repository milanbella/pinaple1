import "../node_modules/pinaple_www/dist/styles/globals.scss";
import type { AppProps } from "next/app";
import Layout from '../components/layout'; 



function MyApp({ Component, pageProps }: AppProps) {
  return ( 
  <Layout>
    <Component {...pageProps} />;
  </Layout>
  )
}
export default MyApp;

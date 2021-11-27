import "../node_modules/pinaple_www/dist/styles/globals.scss";
import "pinaple_components/dist/main.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
export default MyApp;

import "../node_modules/pinaple_www/dist/styles/globals.scss";

import "../styles/components/PErrorMessage.scss"


import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp

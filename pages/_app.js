import "../styles/globals.css"
import Head from "next/head"
import { MoralisProvider } from "react-moralis"
import { NotificationProvider } from "web3uikit"
import Header from "../components/Header"

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>NFT Marketplace</title>
        <meta name="description" content="An NFT Marketplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MoralisProvider 
        appId={process.env.NEXT_PUBLIC_MORALIS_APP_ID} 
        serverUrl={process.env.NEXT_PUBLIC_MORALIS_SERVER_URL}
      >
        <NotificationProvider>
          <Header />
          <Component {...pageProps} />
        </NotificationProvider>
      </MoralisProvider>
    </div>
  ) 
}

export default MyApp

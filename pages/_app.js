"use client";
import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import "tailwindcss/tailwind.css";
import WalletContext from "@/context/wallet";
import Head from "next/head";
import NextNProgress from "nextjs-progressbar";
import { useRef } from "react";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { makeStore } from "@/store/store";
import { persistStore } from "redux-persist";
import { Toaster } from "react-hot-toast";
import { WalletStandardProvider } from "@wallet-standard/react";
import { PersistGate } from "redux-persist/integration/react";

function App({ Component, pageProps }) {
  const storeRef = useRef();
  let persistor;
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
    persistor = persistStore(storeRef.current);
  }

  return (
    <>
      <Head>
        <title>Bitcoin Runes Airdrop</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="The fastest and easiest bitcoin runes airdrop"
        />
        <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo.webp" />
        <meta
          content="The easiest bitcoin runes airdrop tool"
          name="keywords"
        />
        <meta property="og:title" content="runes airdrop " />
        <meta property="og:type" content="runes airdrop" />
        <meta
          property="og:description"
          content="Bitcoin runes airdrop in a min"
        />
        <meta property="og:url" content="https://runs-airdrop.vercel.app/" />
        <meta property="og:site_name" content="runes airdrop"></meta>
        <meta
          property="og:image"
          content="https://runs-airdrop.vercel.app/logo.webp"
        ></meta>
        <meta property="og:image:type" content="image/png"></meta>
        <meta property="og:image:width" content="2000"></meta>
        <meta property="og:image:height" content="2000"></meta>
        <meta property="og:image:alt" content="Logo"></meta>
      </Head>

      <Provider store={storeRef.current}>
        <PersistGate loading={null} persistor={persistor}>
          <WalletStandardProvider>
            <WalletContext>
              <NextNProgress />
              <Component {...pageProps} color="#ffffff" />
              <ToastContainer />
            </WalletContext>
          </WalletStandardProvider>
        </PersistGate>
      </Provider>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
        showOnShallow={true}
      />
    </>
  );
}

export default App;

import Head from "next/head";
import "./../styles/globals.css";
import { StateProvider } from "../context/Context";
import Notification from "@/components/common/Notification";
import { SpeedInsights } from "@vercel/speed-insights/next";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/logo.png" />
      </Head>
      <StateProvider>
        <Component {...pageProps} />
        <Notification />
      </StateProvider>
      <SpeedInsights />
    </>
  );
}

export default MyApp;

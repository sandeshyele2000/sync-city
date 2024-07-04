import Head from 'next/head';
import './../styles/globals.css';
import { StateProvider } from '../context/Context';
import Notification from '@/components/common/Notification';

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
    </>
  );
}

export default MyApp;

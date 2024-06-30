import "./../styles/globals.css";
import { Toaster } from "react-hot-toast";
import { StateProvider } from "../context/Context";

function MyApp({ Component, pageProps }) {
  return (
      <StateProvider>
        <Component {...pageProps} />
        <Toaster />
      </StateProvider>
  );
}

export default MyApp;

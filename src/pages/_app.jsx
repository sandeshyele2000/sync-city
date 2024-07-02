import "./../styles/globals.css";
import { StateProvider } from "../context/Context";
import Notification from "@/components/common/Notification";

function MyApp({ Component, pageProps }) {
  return (
      <StateProvider>
        <Component {...pageProps} />
        <Notification />
      </StateProvider>
  );
}

export default MyApp;

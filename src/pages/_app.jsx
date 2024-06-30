import "./../styles/globals.css";
import { Toaster } from "react-hot-toast";
import { StateProvider } from "../context/Context";
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StateProvider>
        <Component {...pageProps} />
        <Toaster />
      </StateProvider>
    </QueryClientProvider>
  );
}

export default MyApp;

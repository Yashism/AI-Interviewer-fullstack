import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth";
// Extend AppProps to include the session prop
type AppPropsWithSession = AppProps & {
  session: Session | null;
};
function MyApp({ Component, pageProps, session }: AppPropsWithSession) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}


export default MyApp;


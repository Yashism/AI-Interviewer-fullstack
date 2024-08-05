import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "@/components/theme-provider";
import { DM_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs'

const dm_sans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm_sans',
});

export const metadata = {
  title: "AI Interviewer",
  description: "Practice your interview skills with AI",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <ClerkProvider>
      <body className={dm_sans.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
{children}
        </ThemeProvider>
      </body>
      </ClerkProvider>
    </html>
  );
}
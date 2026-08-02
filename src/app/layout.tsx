import type { Metadata } from "next";
import { Suspense } from "react";
import { Atkinson_Hyperlegible, Inter, Source_Sans_3 } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { SplashScreen } from "@/components/layout/splash-screen";
import { CookiePreferences } from "@/components/privacy/cookie-preferences";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { MotionProvider } from "@/components/motion/motion-provider";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans", display: "swap" });
const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-atkinson", display: "swap" });
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "ConectaARCA",
  title: {
    default: "ConectaARCA | Informação, aprendizado e acolhimento",
    template: "%s | ConectaARCA",
  },
  description:
    "Rede acadêmica criada em Itaberaba para comunicados, aprendizagem, projetos estudantis e acolhimento seguro.",
  keywords: [
    "ARCA",
    "Itaberaba",
    "educação profissional",
    "rede acadêmica",
    "Bahia",
    "comunidade escolar",
  ],
  authors: [{ name: "ConectaARCA" }],
  creator: "ConectaARCA",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "ConectaARCA",
    title: "ConectaARCA | A comunidade escolar em um só espaço",
    description:
      "Informação, aprendizado, projetos e acolhimento para a comunidade escolar de Itaberaba.",
    images: [
      {
        url: "/brand/arca-icon.png",
        width: 512,
        height: 512,
        alt: "Símbolo do ConectaARCA",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ConectaARCA",
    description: "Informação, aprendizado e acolhimento em um só espaço.",
    images: ["/brand/arca-icon.png"],
  },
  robots: { index: true, follow: true },
  category: "education",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          id="splash-session-state"
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('arca-splash-seen'))document.documentElement.dataset.splashSeen='true'}catch(e){}",
          }}
        />
      </head>
      <body className={`${inter.variable} ${sourceSans.variable} ${atkinson.variable}`}>
        <MotionProvider>
          <SplashScreen />
          <Suspense fallback={null}>
            <ScrollToTop />
          </Suspense>
          <a href="#conteudo" className="skip-link">
            Pular para o conteúdo
          </a>
          {children}
          <Toaster richColors position="top-right" closeButton />
          <CookiePreferences />
        </MotionProvider>
      </body>
    </html>
  );
}

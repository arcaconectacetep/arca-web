import type { Metadata } from "next";
import { Suspense } from "react";
import { Atkinson_Hyperlegible, Inter, Source_Sans_3 } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { SplashScreen } from "@/components/layout/splash-screen";
import { CookiePreferences } from "@/components/privacy/cookie-preferences";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
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
  applicationName: "ConectaCETEP",
  title: {
    default: "ConectaCETEP | Informação, aprendizado e acolhimento",
    template: "%s | ConectaCETEP",
  },
  description:
    "Rede acadêmica do CETEP de Itaberaba para comunicados, aprendizagem, projetos estudantis e acolhimento seguro.",
  keywords: [
    "CETEP",
    "Itaberaba",
    "educação profissional",
    "rede acadêmica",
    "Bahia",
    "comunidade escolar",
  ],
  authors: [{ name: "ConectaCETEP" }],
  creator: "ConectaCETEP",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "ConectaCETEP",
    title: "ConectaCETEP | A comunidade escolar em um só espaço",
    description:
      "Informação, aprendizado, projetos e acolhimento para a comunidade CETEP de Itaberaba.",
    images: [
      {
        url: "/brand/conectacetep-icon.png",
        width: 512,
        height: 512,
        alt: "Símbolo do ConectaCETEP",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ConectaCETEP",
    description: "Informação, aprendizado e acolhimento em um só espaço.",
    images: ["/brand/conectacetep-icon.png"],
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
      <body className={`${inter.variable} ${sourceSans.variable} ${atkinson.variable}`}>
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
      </body>
    </html>
  );
}

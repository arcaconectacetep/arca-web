import type { Metadata } from "next";
import { Newsreader, Source_Sans_3 } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
const body = Source_Sans_3({ subsets: ["latin"], variable: "--font-body" });
const display = Newsreader({ subsets: ["latin"], variable: "--font-display" });
export const metadata: Metadata = {
  title: { default: "ConectaCETEP", template: "%s · ConectaCETEP" },
  description: "Informação, aprendizado e acolhimento para a comunidade CETEP.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${body.variable} ${display.variable}`}>
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </a>
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}

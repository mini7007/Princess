import type { Metadata } from "next";
import { Cormorant_Garamond, Nunito, Caveat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({ variable: "--font-serif", subsets: ["latin"], weight: ["500", "600", "700"] });
const nunito = Nunito({ variable: "--font-sans", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-hand", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mera Bacha's Little Secret",
  description: "A little secret, made especially for Mera Bacha by Mohan",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${nunito.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

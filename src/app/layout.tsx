import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { OnboardingProvider } from "@/lib/context";
import { NextAuthProvider } from "@/providers/nextAuthProvider";
import Header from "@/components/header/header";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AULAD",
  description: "Aula de Aprendizaje Digital",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <NextAuthProvider>
          <OnboardingProvider>
            <Header />
            {children}
          </OnboardingProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}

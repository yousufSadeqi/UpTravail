import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "../providers/ThemeProvider";
import Header from "../components/ui/layout/Header";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Service Marketplace | Find Professional Services",
  description: "Connect with skilled professionals for your home service needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ThemeProvider>
            <Header />
            <main>{children}</main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

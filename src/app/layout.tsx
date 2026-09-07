import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CrmLayout } from "@/components/CrmLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Travel to Uttarakhand - Tourism CRM & Operations",
  description: "Official CRM, Itinerary Builder, Vouchers & Invoice Studio for Travel to Uttarakhand",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-slate-100 text-slate-900 min-h-screen`}>
        <AuthProvider>
          <CrmLayout>
            {children}
          </CrmLayout>
        </AuthProvider>
      </body>
    </html>
  );
}

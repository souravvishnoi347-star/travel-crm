import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CrmLayout } from "@/components/CrmLayout";

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
      <body className="font-sans antialiased bg-slate-100 text-slate-900 min-h-screen">
        <AuthProvider>
          <CrmLayout>
            {children}
          </CrmLayout>
        </AuthProvider>
      </body>
    </html>
  );
}

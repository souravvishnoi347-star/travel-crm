import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { GlobalSearch } from "@/components/GlobalSearch";

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
        <Sidebar />
        <main className="lg:pl-72 flex-1 flex flex-col min-h-screen pt-16 lg:pt-0">
          <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-gray-200/80 px-4 md:px-6 py-2.5 flex items-center justify-between">
            <GlobalSearch />
            <div className="flex items-center gap-3 text-xs">
              <a 
                href="https://traveltouttarakhand.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 text-sky-700 font-semibold bg-sky-50 px-2.5 py-1 rounded-lg hover:bg-sky-100 transition"
              >
                🌐 traveltouttarakhand.com
              </a>
              <span className="hidden sm:inline text-gray-400">|</span>
              <span className="text-gray-600 font-medium">Mr. Amit kumar</span>
            </div>
          </header>
          <div className="flex-1 w-full mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

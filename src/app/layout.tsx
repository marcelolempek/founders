import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavigationProvider } from "@/context/NavigationContext";
import { UserProvider } from "@/context/UserContext";
import { PageStateProvider } from "@/context/PageStateContext";
import { ToastProvider } from "@/components/ui/Toast";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import CreatePostModal from "@/components/shared/CreatePostModal";

import PostDetailModal from "@/components/shared/PostDetailModal";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://empreendedoresdecristo.com'),
  title: "Empreendedores de Cristo - Rede Profissional & Marketplace",
  description: "A rede social e marketplace definitivos para empreendedores cristãos. Conecte-se, divulgue seus serviços e fortaleça seus negócios.",
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "Empreendedores de Cristo - Rede Profissional & Marketplace",
    description: "A rede social e marketplace definitivos para empreendedores cristãos.",
    url: '/',
    siteName: 'Empreendedores de Cristo',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/logo-og.png',
        width: 1200,
        height: 630,
        alt: 'Empreendedores de Cristo Logo',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Empreendedores de Cristo - Rede Profissional & Marketplace",
    description: "A rede social e marketplace definitivos para empreendedores cristãos.",
    images: ['/logo-og.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&family=Noto+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className="bg-[#0e2741] text-white font-display overflow-x-hidden antialiased pb-20 md:pb-0 min-h-screen"
        style={{ backgroundColor: '#0e2741', color: 'white' }}
      >
        <ToastProvider>
          <UserProvider>
            <PageStateProvider>
              <NavigationProvider>
                <div className="flex flex-col min-h-screen">
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                </div>
                <MobileBottomNav />
                <CreatePostModal />

                <PostDetailModal />
              </NavigationProvider>
            </PageStateProvider>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

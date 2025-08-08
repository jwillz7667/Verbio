import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { PageTransitions } from '@/components/PageTransitions';
import CommandPalette from '@/components/CommandPalette';
import { Dock } from '@/components/ui/Dock';
import { APP_CONFIG } from '@/lib/constants';
import { Footer } from '@/components/Footer';
import './globals.css';
import './Voice Translation App/styles/globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: {
    default: 'Verbio - Real-time Voice Translation',
    template: '%s | Verbio',
  },
  description: 'Break language barriers with instant AI-powered voice translation between English and Spanish',
  applicationName: 'Verbio',
  authors: [{ name: 'Verbio Team' }],
  creator: 'Verbio',
  publisher: 'Verbio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(APP_CONFIG.url),
  alternates: {
    canonical: APP_CONFIG.url,
  },
  openGraph: {
    title: 'Verbio - Real-time Voice Translation',
    description: 'Break language barriers with instant AI-powered voice translation',
    url: APP_CONFIG.url,
    siteName: 'Verbio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Verbio - Voice Translation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verbio - Real-time Voice Translation',
    description: 'Break language barriers with instant AI-powered voice translation',
    images: ['/twitter-image.png'],
    creator: '@verbioapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
      },
    ],
  },
  manifest: '/manifest.webmanifest',
  category: 'Utilities',
  keywords: [
    'voice translation',
    'real-time translation',
    'AI translator',
    'speech to speech',
    'English Spanish translator',
  ],
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '',
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <link rel="canonical" href={APP_CONFIG.url} />
        <meta name="theme-color" content="#0f172a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta property="og:locale" content="en_US" />
        <script
          type="application/ld+json"
          // JSON-LD: Organization + WebSite + SoftwareApplication
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Verbio',
              url: APP_CONFIG.url,
              logo: `${APP_CONFIG.url}/apple-touch-icon.png`,
              sameAs: ['https://twitter.com/verbioapp'],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Verbio',
              url: APP_CONFIG.url,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${APP_CONFIG.url}/?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Verbio',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {/* Smooth page transitions across the app */}
            <div id="app-shell" className="relative min-h-dvh pb-24">
              {/* Page transition wrapper */}
              <PageTransitions>{children}</PageTransitions>
              <Dock />
            </div>
            {/* Global command palette (Cmd/Ctrl+K) */}
            <CommandPalette />
            <Footer />
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
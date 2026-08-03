import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { QueryProvider } from '@/components/shared/query-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-heading',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Project Cheesecake Senior Sleepover 2026 | Food Ordering Portal',
    template: '%s | Project Cheesecake Senior Sleepover',
  },
  description:
    'Order your dinner and breakfast for the Project Cheesecake Senior Sleepover on 21-22 August 2026. Choose from McDonald\'s dinner menu and breakfast items. Simple QR payment.',
  keywords: [
    'Project Cheesecake',
    'Senior Sleepover',
    'Food Ordering',
    'McDonald\'s',
    'Breakfast',
    'Dinner',
    '2026',
  ],
  authors: [{ name: 'Project Cheesecake Admin' }],
  openGraph: {
    title: 'Project Cheesecake Senior Sleepover 2026 | Food Ordering Portal',
    description: 'Order your meals for the Project Cheesecake Senior Sleepover event.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased bg-[#09090b]">
        <ThemeProvider>
          <QueryProvider>
            <TooltipProvider>
              {children}
              <Toaster
                position="top-right"
                richColors
                closeButton
                toastOptions={{
                  duration: 4000,
                }}
              />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: '1TAP | Emergency Buddy',
  description: 'Instant emergency help and personal safety orchestration',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className="font-body antialiased selection:bg-accent selection:text-accent-foreground overflow-x-hidden min-h-screen bg-background" suppressHydrationWarning>
        <FirebaseClientProvider>
          <Navbar />
          <main className="min-h-screen w-full overflow-x-hidden">
            {children}
          </main>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

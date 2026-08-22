import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'AI Browser Agent - Control Dashboard',
  description: 'NextGen Autonomous Browser Control Panel and Real-Time Execution View',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-50 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
          {children}
        </main>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Voom AI Sniper',
  description: 'Initial foundation for the Voom AI Sniper platform.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Next Todo',
  description: 'Todo app with Supabase auth',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

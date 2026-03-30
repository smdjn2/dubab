'use client';

import './globals.css';
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>듀밥 - 같이 밥 먹을 사람</title>
        <meta name="description" content="같이 밥 먹을 사람을 찾는 동네 기반 앱" />
        <meta name="theme-color" content="#8BA888" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
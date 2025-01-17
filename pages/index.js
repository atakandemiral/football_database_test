import React from 'react';
import dynamic from 'next/dynamic';

// DnD özelliği için client-side rendering kullan
const FootballApp = dynamic(() => import('../src/App'), {
  ssr: false
});

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <FootballApp />
    </main>
  );
}

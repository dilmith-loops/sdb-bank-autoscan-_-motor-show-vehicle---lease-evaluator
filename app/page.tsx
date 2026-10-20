'use client';

import dynamic from 'next/dynamic';

// The app reads localStorage and the camera on first render, so render it client-side only
const App = dynamic(() => import('../src/App'), { ssr: false });

export default function Page() {
  return <App />;
}

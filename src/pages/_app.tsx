import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import '../styles/globals.css';
import { Web3Provider } from '../context/Web3Context';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
      <Component {...pageProps} />
    </Web3Provider>
  );
} 
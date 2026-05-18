'use client';

import { useState, useEffect } from 'react';
import { connectWallet, getPublicKey } from '@/lib/stellar';

interface ConnectButtonProps {
  onConnect?: (publicKey: string) => void;
}

export default function ConnectButton({ onConnect }: ConnectButtonProps) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicKey().then((key) => {
      if (key) {
        setPublicKey(key);
        setConnected(true);
      }
      setLoading(false);
    });
  }, []);

  async function handleConnect() {
    try {
      const key = await connectWallet();
      setPublicKey(key);
      setConnected(true);
      onConnect?.(key);
    } catch (error) {
      console.error('Error connecting:', error);
    }
  }

  if (loading) {
    return <button className="border px-4 py-2 rounded" disabled>Loading...</button>;
  }

  if (connected) {
    return (
      <div className="text-sm text-gray-600">
        {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Connect Wallet
    </button>
  );
}
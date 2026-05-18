'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { connectWallet, getPublicKey } from '@/lib/stellar';
import {
  registerIssuer,
  getIssuer,
  getConfig,
  IssuerCategory,
  hashData,
  stroopsToXLM,
} from '@/lib/contract';

export default function RegisterIssuerPage() {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [existingIssuer, setExistingIssuer] = useState<any>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Education');
  const [metadata, setMetadata] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registrationFee, setRegistrationFee] = useState('0');

  useEffect(() => {
    async function checkWallet() {
      try {
        const key = await getPublicKey();
        if (key) {
          setPublicKey(key);
          setConnected(true);
          const issuer = await getIssuer(key);
          setExistingIssuer(issuer);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    const config = getConfig();
    config.then((c) => setRegistrationFee(stroopsToXLM(c.registration_fee.toString())));

    checkWallet();
  }, []);

  async function handleConnect() {
    try {
      const key = await connectWallet();
      setPublicKey(key);
      setConnected(true);
      const issuer = await getIssuer(key);
      setExistingIssuer(issuer);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !metadata) return;

    setSubmitting(true);
    try {
      const metadataHash = await hashData(metadata);
      localStorage.setItem(`metadata_${metadataHash}`, metadata);
      await registerIssuer(name, IssuerCategory[category as keyof typeof IssuerCategory], metadataHash);
      router.push(`/issuer/${publicKey}`);
    } catch (error) {
      console.error('Error registering:', error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!connected) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Connect Wallet to Register</h1>
        <p className="text-gray-600 mb-6">
          You need to connect your Freighter wallet to register as an issuer.
        </p>
        <button
          onClick={handleConnect}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (existingIssuer) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">You are already registered</h1>
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="font-medium text-lg">{existingIssuer.name}</div>
          <div className="text-gray-600">{existingIssuer.category}</div>
          <div className="text-sm text-gray-500 mt-2">
            {existingIssuer.credentials_issued} credentials issued
          </div>
        </div>
        <a
          href={`/issuer/${publicKey}`}
          className="text-blue-600 hover:underline"
        >
          View your issuer profile →
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Register as Issuer</h1>
      <p className="text-gray-600 mb-6">
        Registration costs {registrationFee} XLM
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Institution Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={64}
            required
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="Education">Education</option>
            <option value="Employment">Employment</option>
            <option value="DAO">DAO</option>
            <option value="Certification">Certification</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Metadata (JSON)
          </label>
          <textarea
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            rows={4}
            className="w-full border rounded-lg px-4 py-2"
            placeholder='{"description": "...", "website": "..."}'
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
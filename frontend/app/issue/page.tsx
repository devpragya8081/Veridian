'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { connectWallet, getPublicKey } from '@/lib/stellar';
import {
  getIssuer,
  issueCredential,
  getConfig,
  hashData,
  stroopsToXLM,
  Issuer,
} from '@/lib/contract';

export default function IssueCredentialPage() {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [issuer, setIssuer] = useState<Issuer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [issuanceFee, setIssuanceFee] = useState('0');

  const [holder, setHolder] = useState('');
  const [credentialType, setCredentialType] = useState('');
  const [credentialData, setCredentialData] = useState('');
  const [expiry, setExpiry] = useState('');

  useEffect(() => {
    async function checkWallet() {
      try {
        const key = await getPublicKey();
        if (key) {
          setPublicKey(key);
          setConnected(true);
          const issuerData = await getIssuer(key);
          setIssuer(issuerData);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    getConfig().then((c) => setIssuanceFee(stroopsToXLM(c.issuance_fee.toString())));

    checkWallet();
  }, []);

  async function handleConnect() {
    try {
      const key = await connectWallet();
      setPublicKey(key);
      setConnected(true);
      const issuerData = await getIssuer(key);
      setIssuer(issuerData);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!holder || !credentialType || !credentialData) return;

    setSubmitting(true);
    try {
      const dataHash = await hashData(credentialData);
      localStorage.setItem(`credential_${dataHash}`, credentialData);

      const expiresAt = expiry ? parseInt(expiry) : 0;
      const newId = await issueCredential(holder, credentialType, dataHash, expiresAt);
      router.push(`/credential/${newId}`);
    } catch (error) {
      console.error('Error issuing credential:', error);
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
        <h1 className="text-2xl font-bold mb-4">Connect Wallet to Issue Credentials</h1>
        <p className="text-gray-600 mb-6">
          You need to connect your Freighter wallet to issue credentials.
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

  if (!issuer) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Not an Issuer</h1>
        <p className="text-gray-600 mb-6">
          You need to register as an issuer before you can issue credentials.
        </p>
        <a
          href="/issuers/register"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
        >
          Register as Issuer
        </a>
      </div>
    );
  }

  if (!issuer.active) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Issuer Inactive</h1>
        <p className="text-gray-600 mb-6">
          Your issuer account is currently inactive. Reactivate it to issue credentials.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Issue Credential</h1>
      <p className="text-gray-600 mb-6">
        Issuing this credential costs {issuanceFee} XLM
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Holder Address (Stellar address)
          </label>
          <input
            type="text"
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2"
            placeholder="G..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credential Type
          </label>
          <input
            type="text"
            value={credentialType}
            onChange={(e) => setCredentialType(e.target.value)}
            maxLength={32}
            required
            className="w-full border rounded-lg px-4 py-2"
            placeholder="e.g., Bachelor of Science, Employment Verification"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credential Data
          </label>
          <textarea
            value={credentialData}
            onChange={(e) => setCredentialData(e.target.value)}
            rows={4}
            required
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Describe the credential..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry (optional)
          </label>
          <input
            type="number"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Ledger number (leave empty for no expiry)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter a future ledger number for expiry
          </p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Issuing...' : 'Issue Credential'}
        </button>
      </form>
    </div>
  );
}
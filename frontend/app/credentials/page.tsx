'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPublicKey, connectWallet } from '@/lib/stellar';
import {
  getCredentialsByHolder,
  getCredential,
  verify,
  getIssuer,
  Credential,
  VerificationResult,
} from '@/lib/contract';

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<(Credential & { verification: VerificationResult; issuerName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState('');

  useEffect(() => {
    async function loadCredentials() {
      try {
        const key = await getPublicKey();
        if (!key) {
          setLoading(false);
          return;
        }
        setPublicKey(key);
        setConnected(true);

        const credIds = await getCredentialsByHolder(key);
        const creds = [];
        for (const id of credIds) {
          const cred = await getCredential(id);
          if (cred) {
            const verification = await verify(id);
            const issuer = await getIssuer(cred.issuer);
            creds.push({
              ...cred,
              verification,
              issuerName: issuer?.name || 'Unknown',
            });
          }
        }
        setCredentials(creds);
      } catch (error) {
        console.error('Error loading credentials:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCredentials();
  }, []);

  async function handleConnect() {
    try {
      const key = await connectWallet();
      setPublicKey(key);
      setConnected(true);
      window.location.reload();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }

  function copyShareLink(credentialId: number) {
    const url = `${window.location.origin}/credential/${credentialId}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  }

  if (!connected) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-gray-600 mb-6">
          Connect your wallet to view your credentials.
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

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Credentials</h1>

      {credentials.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-2">No credentials found for this address.</p>
          <p className="text-sm text-gray-500">
            Receive credentials from issuers to see them here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {credentials.map((cred) => (
            <div key={cred.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-lg">{cred.credential_type}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Issued by: {cred.issuerName}
                  </div>
                  <div className="text-sm text-gray-500">
                    Issued at ledger {cred.issued_at}
                    {cred.expires_at > 0 && ` • Expires at ledger ${cred.expires_at}`}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      cred.verification.valid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {cred.verification.status === 0
                      ? 'Valid'
                      : cred.verification.status === 1
                      ? 'Revoked'
                      : 'Expired'}
                  </span>
                  <button
                    onClick={() => copyShareLink(cred.id)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Share
                  </button>
                  <Link
                    href={`/credential/${cred.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
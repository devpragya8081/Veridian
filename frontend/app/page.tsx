'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getIssuerCount, getCredentialCount, getIssuer, getIssuerAtIndex } from '@/lib/contract';
import { Issuer } from '@/lib/contract';

export default function Home() {
  const [issuerCount, setIssuerCount] = useState(0);
  const [credentialCount, setCredentialCount] = useState(0);
  const [featuredIssuers, setFeaturedIssuers] = useState<Issuer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const count = await getIssuerCount();
        setIssuerCount(count);
        const credCount = await getCredentialCount();
        setCredentialCount(credCount);

        const issuers: Issuer[] = [];
        for (let i = 0; i < Math.min(count, 6); i++) {
          const addr = await getIssuerAtIndex(i);
          if (addr) {
            const issuer = await getIssuer(addr);
            if (issuer && issuer.active) {
              issuers.push(issuer);
            }
          }
        }
        setFeaturedIssuers(issuers);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Issue trust. Verify on-chain.
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Veridian is a decentralized credential protocol on Stellar.
          Institutions issue verifiable attestations directly to Stellar addresses.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/issuers/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Register as Issuer
          </Link>
          <Link
            href="/credentials"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
          >
            View My Credentials
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-6 mb-16">
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-gray-900">{loading ? '...' : issuerCount}</div>
          <div className="text-gray-600">Registered Issuers</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-gray-900">{loading ? '...' : credentialCount}</div>
          <div className="text-gray-600">Credentials Issued</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-gray-900">0</div>
          <div className="text-gray-600">Verifications</div>
        </div>
      </section>

      {featuredIssuers.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Issuers</h2>
          <div className="grid grid-cols-3 gap-4">
            {featuredIssuers.map((issuer) => (
              <div key={issuer.address} className="border rounded-lg p-4">
                <div className="font-medium text-gray-900">{issuer.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {issuer.category}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {issuer.credentials_issued} credentials issued
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">For Issuers</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Register as an issuer on-chain</li>
              <li>Issue credentials to Stellar addresses</li>
              <li>Manage and revoke credentials as needed</li>
            </ol>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">For Holders</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Receive credentials from issuers</li>
              <li>Share credential IDs as proof</li>
              <li>Verifiers check on-chain in real-time</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
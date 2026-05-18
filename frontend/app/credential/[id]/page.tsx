'use client';

import { useEffect, useState, use } from 'react';
import { verify, getCredential, getIssuer, VerificationResult, Issuer } from '@/lib/contract';

export default function CredentialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [issuer, setIssuer] = useState<Issuer | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVerification();
  }, [resolvedParams.id]);

  async function loadVerification() {
    try {
      const result = await verify(parseInt(resolvedParams.id));
      setVerification(result);
      const issuerData = await getIssuer(result.issuer);
      setIssuer(issuerData);
    } catch (error) {
      console.error('Error loading verification:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setRefreshing(true);
    await loadVerification();
    setRefreshing(false);
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!verification) {
    return <div className="text-center py-8">Credential not found</div>;
  }

  const statusColors: Record<number, string> = {
    0: 'bg-green-500',
    1: 'bg-red-500',
    2: 'bg-gray-500',
  };

  const statusLabels: Record<number, string> = {
    0: 'VALID',
    1: 'REVOKED',
    2: 'EXPIRED',
  };

  return (
    <div>
      <div
        className={`${statusColors[verification.status]} text-white text-center py-8 rounded-lg mb-6`}
      >
        <div className="text-4xl font-bold">{statusLabels[verification.status]}</div>
        <div className="mt-2">
          {verification.valid ? 'This credential is valid' : 'This credential is not valid'}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Credential Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Credential ID</div>
            <div className="font-medium">{verification.credential_id}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Type</div>
            <div className="font-medium">{verification.credential_type}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Issuer</div>
            <div className="font-medium">
              {issuer?.name || 'Unknown'}
              <span className="text-gray-500 text-sm ml-2">
                ({verification.issuer.slice(0, 8)}...{verification.issuer.slice(-4)})
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Holder</div>
            <div className="font-medium">
              {verification.holder.slice(0, 8)}...{verification.holder.slice(-4)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Issued At</div>
            <div className="font-medium">Ledger {verification.issued_at}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Expires At</div>
            <div className="font-medium">
              {verification.expires_at > 0 ? `Ledger ${verification.expires_at}` : 'No expiry'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Data Hash</h2>
        <div className="text-sm text-gray-500 mb-2">
          The full credential data is stored off-chain by the issuer.
          This hash is stored on-chain as a commitment.
        </div>
        <div className="font-mono text-sm bg-white p-3 rounded border break-all">
          (SHA-256 hash stored on-chain)
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleVerify}
          disabled={refreshing}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {refreshing ? 'Verifying...' : 'Verify Again'}
        </button>
      </div>

      <p className="text-sm text-gray-500 text-center mt-4">
        This verification is live — it reflects the current on-chain state at time of page load.
      </p>
    </div>
  );
}
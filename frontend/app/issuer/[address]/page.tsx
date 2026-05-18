'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getIssuer,
  getCredentialsByIssuer,
  getCredential,
  verify,
  deactivateIssuer,
  reactivateIssuer,
  updateIssuerMetadata,
  revokeCredential,
  Issuer,
  Credential,
  VerificationResult,
  categoryToLabel,
  getPublicKey,
} from '@/lib/contract';
import { connectWallet } from '@/lib/stellar';

export default function IssuerProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [issuer, setIssuer] = useState<Issuer | null>(null);
  const [credentials, setCredentials] = useState<(Credential & { verification: VerificationResult | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [showUpdateMetadata, setShowUpdateMetadata] = useState(false);
  const [newMetadata, setNewMetadata] = useState('');
  const [hashData, setHashData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const issuerData = await getIssuer(resolvedParams.address);
        if (issuerData) {
          setIssuer(issuerData);
          const credIds = await getCredentialsByIssuer(resolvedParams.address);
          const creds = [];
          for (const id of credIds) {
            const cred = await getCredential(id);
            if (cred) {
              const verification = await verify(id);
              creds.push({ ...cred, verification });
            }
          }
          setCredentials(creds);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    getPublicKey().then((key) => {
      if (key) {
        setPublicKey(key);
        setConnected(true);
      }
    });
  }, [resolvedParams.address]);

  async function handleDeactivate() {
    if (!confirm('Are you sure you want to deactivate your issuer account?')) return;
    try {
      await deactivateIssuer(resolvedParams.address);
      router.refresh();
    } catch (error) {
      console.error('Error deactivating:', error);
    }
  }

  async function handleReactivate() {
    try {
      await reactivateIssuer(resolvedParams.address);
      router.refresh();
    } catch (error) {
      console.error('Error reactivating:', error);
    }
  }

  async function handleUpdateMetadata() {
    if (!newMetadata) return;
    try {
      const hash = await hashData(newMetadata);
      localStorage.setItem(`metadata_${hash}`, newMetadata);
      await updateIssuerMetadata(hash);
      setShowUpdateMetadata(false);
      setNewMetadata('');
      router.refresh();
    } catch (error) {
      console.error('Error updating metadata:', error);
    }
  }

  async function handleRevoke(credentialId: number) {
    if (!confirm('Are you sure you want to revoke this credential?')) return;
    try {
      await revokeCredential(credentialId);
      router.refresh();
    } catch (error) {
      console.error('Error revoking:', error);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!issuer) {
    return <div className="text-center py-8">Issuer not found</div>;
  }

  const isOwner = connected && publicKey === resolvedParams.address;

  return (
    <div>
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{issuer.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                {categoryToLabel(issuer.category)}
              </span>
              <span className={`text-sm ${issuer.active ? 'text-green-600' : 'text-red-600'}`}>
                {issuer.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Address: {issuer.address.slice(0, 8)}...{issuer.address.slice(-4)}
            </div>
            <div className="text-sm text-gray-500">
              Registered at ledger {issuer.registered_at}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {issuer.credentials_issued} credentials issued
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="mt-4 pt-4 border-t flex gap-2 flex-wrap">
            <button
              onClick={() => setShowUpdateMetadata(!showUpdateMetadata)}
              className="border px-3 py-2 rounded hover:bg-gray-100"
            >
              Update Metadata
            </button>
            {issuer.active ? (
              <button
                onClick={handleDeactivate}
                className="border border-red-500 text-red-500 px-3 py-2 rounded hover:bg-red-50"
              >
                Deactivate Account
              </button>
            ) : (
              <button
                onClick={handleReactivate}
                className="border border-green-500 text-green-500 px-3 py-2 rounded hover:bg-green-50"
              >
                Reactivate Account
              </button>
            )}
            <Link
              href="/issue"
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            >
              Issue New Credential
            </Link>
          </div>
        )}

        {showUpdateMetadata && (
          <div className="mt-4 p-4 border rounded">
            <h3 className="font-medium mb-2">Update Metadata</h3>
            <textarea
              value={newMetadata}
              onChange={(e) => setNewMetadata(e.target.value)}
              rows={4}
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder='{"description": "...", "website": "..."}'
            />
            <button
              onClick={handleUpdateMetadata}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4">Issued Credentials</h2>
      {credentials.length === 0 ? (
        <p className="text-gray-500">No credentials issued yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Holder</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Issued</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Expiry</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                {isOwner && <th className="px-4 py-2 text-left text-sm font-medium">Action</th>}
              </tr>
            </thead>
            <tbody>
              {credentials.map((cred) => (
                <tr key={cred.id} className="border-t">
                  <td className="px-4 py-2">
                    <Link href={`/credential/${cred.id}`} className="text-blue-600 hover:underline">
                      {cred.id}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {cred.holder.slice(0, 8)}...{cred.holder.slice(-4)}
                  </td>
                  <td className="px-4 py-2">{cred.credential_type}</td>
                  <td className="px-4 py-2 text-sm">{cred.issued_at}</td>
                  <td className="px-4 py-2 text-sm">
                    {cred.expires_at > 0 ? cred.expires_at : 'No expiry'}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        cred.verification?.valid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {cred.verification?.status === 0
                        ? 'Active'
                        : cred.verification?.status === 1
                        ? 'Revoked'
                        : 'Expired'}
                    </span>
                  </td>
                  {isOwner && cred.verification?.status === 0 && (
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleRevoke(cred.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Revoke
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
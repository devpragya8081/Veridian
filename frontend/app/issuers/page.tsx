'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getIssuerCount, getIssuerAtIndex, getIssuer, Issuer, IssuerCategory } from '@/lib/contract';
import { categoryToLabel } from '@/lib/contract';

const CATEGORIES = ['All', 'Education', 'Employment', 'DAO', 'Certification', 'Other'];

export default function IssuersPage() {
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    async function loadIssuers() {
      try {
        const count = await getIssuerCount();
        const allIssuers: Issuer[] = [];
        for (let i = 0; i < count; i++) {
          const addr = await getIssuerAtIndex(i);
          if (addr) {
            const issuer = await getIssuer(addr);
            if (issuer) {
              allIssuers.push(issuer);
            }
          }
        }
        setIssuers(allIssuers);
      } catch (error) {
        console.error('Error loading issuers:', error);
      } finally {
        setLoading(false);
      }
    }
    loadIssuers();
  }, []);

  const filteredIssuers = issuers.filter((issuer) => {
    const matchesCategory = filter === 'All' || categoryToLabel(issuer.category) === filter;
    const matchesSearch = issuer.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const paginatedIssuers = filteredIssuers.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const totalPages = Math.ceil(filteredIssuers.length / itemsPerPage);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Issuers</h1>
        <Link
          href="/issuers/register"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Register as Issuer
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 flex-1"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedIssuers.map((issuer) => (
              <Link
                key={issuer.address}
                href={`/issuer/${issuer.address}`}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{issuer.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {issuer.address.slice(0, 8)}...{issuer.address.slice(-4)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {categoryToLabel(issuer.category)}
                    </span>
                    <div className="text-sm text-gray-500 mt-2">
                      {issuer.credentials_issued} credentials
                    </div>
                    <div className={`text-sm ${issuer.active ? 'text-green-600' : 'text-red-600'}`}>
                      {issuer.active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`px-4 py-2 rounded ${page === i ? 'bg-blue-600 text-white' : 'border'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
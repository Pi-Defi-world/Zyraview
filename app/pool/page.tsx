"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Reserve {
  asset?: string;
  amount?: string;
}

interface Pool {
  id?: string;
  paging_token?: string;
  fee_bp?: number;
  type?: string;
  total_trustlines?: string;
  total_shares?: string;
  reserves?: Reserve[];
  last_modified_ledger?: number;
  last_modified_time?: string;
  _links?: {
    self?: {
      href?: string;
    };
    operations?: {
      href?: string;
    };
    transactions?: {
      href?: string;
    };
  };
}

interface PoolsApiResponse {
  _embedded: {
    records: Pool[];
  };
  _links: {
    self: {
      href: string;
    };
    next?: {
      href: string;
    };
    prev?: {
      href: string;
    };
  };
}

export default function Pools() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 60s cache helpers
  const CACHE_TTL_MS = 60_000;
  const getCached = (key: string) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.ts !== 'number') return null;
      if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
      return parsed.data as PoolsApiResponse;
    } catch { return null; }
  };
  const setCached = (key: string, data: any) => {
    try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch {}
  };

  const fetchPools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = 'https://api.testnet.minepi.com/liquidity_pools?limit=200&order=desc';
      const cacheKey = `pools_${btoa(apiUrl)}`;
      const cached = getCached(cacheKey);
      if (cached) {
        setPools(cached._embedded?.records || []);
        setLoading(false);
        return;
      }
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch liquidity pools');
      const data: PoolsApiResponse = await response.json();
      setCached(cacheKey, data);
      setPools(data._embedded?.records || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  const formatAsset = (assetString?: string): string => {
    if (!assetString) return 'Unknown';
    if (assetString === 'native') {
      return 'PI';
    }
    
    const parts = assetString.split(':');
    if (parts.length === 2) {
      const [assetCode, issuer] = parts;
      return `${assetCode}:${issuer.substring(0, 8)}...`;
    }
    
    return assetString;
  };

  const formatAmount = (amount?: string): string => {
    if (!amount || amount === '') return '0';
    const num = parseFloat(amount);
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 7 
    });
  };

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString();
  };

  const filteredPools = pools.filter(pool =>
    pool.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pool.reserves?.some(reserve => 
      formatAsset(reserve.asset).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600">Loading pools...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 text-lg sm:text-xl">Error Loading Pools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600 text-sm sm:text-base break-words">{error}</p>
                <Button onClick={fetchPools} className="mt-4 w-full sm:w-auto">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 px-2">
              Liquidity Pools
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">
              View and manage liquidity pools on the Pi Network
            </p>
          </div>
          
          <div className="mb-4 sm:mb-6">
            <Input
              placeholder="Search pools by ID or asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:max-w-md mx-auto"
            />
          </div>

          <div className="grid gap-4 sm:gap-6">
            {filteredPools.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 text-sm sm:text-base">
                    {searchQuery ? "No pools found matching your search." : "No pools available."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredPools.map((pool) => (
                <Card key={pool.id || `pool-${Math.random()}`} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg break-all">
                          Pool {pool.id ? `${pool.id.substring(0, 8)}...${pool.id.substring(pool.id.length - 8)}` : 'Unknown'}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm mt-1">
                          <span className="block sm:inline">Fee: {((pool.fee_bp || 0) / 100).toFixed(2)}%</span>
                          <span className="hidden sm:inline"> • </span>
                          <span className="block sm:inline">Trustlines: {parseInt(pool.total_trustlines || '0').toLocaleString()}</span>
                        </CardDescription>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <div className="text-xs sm:text-sm text-gray-500">
                          Total Shares
                        </div>
                        <div className="font-semibold text-sm sm:text-base">
                          {formatAmount(pool.total_shares)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 text-sm sm:text-base">Reserves</h4>
                        <div className="space-y-2">
                          {pool.reserves?.map((reserve, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium text-sm sm:text-base break-all">{formatAsset(reserve.asset)}</span>
                              <span className="text-base sm:text-lg font-semibold">{formatAmount(reserve.amount)}</span>
                            </div>
                          )) || <p className="text-gray-500 text-sm">No reserves</p>}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 border-t">
                        <div className="text-xs sm:text-sm text-gray-500 break-words">
                          Last Modified: {formatDateTime(pool.last_modified_time)}
                        </div>
                        {pool.id && (
                          <Link href={`/pool/${pool.id}/history`} className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm">
                              View History
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="mt-6 sm:mt-8 text-center">
            <Link href="/">
              <Button className="w-full sm:w-auto border border-input bg-background hover:bg-accent hover:text-accent-foreground">← Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
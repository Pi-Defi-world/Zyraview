'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Building, TrendingUp,   DollarSign, Hash, Zap, Lock, Globe, Box } from 'lucide-react';
import { horizon } from "@/api/horizon";
import { okx } from '@/api/okx';
import { socialchain } from '@/api/socialchain';
import { Spinner } from '@/components/ui/spinner';
import { usePiNetwork } from '@/context/PiNetworkContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MobilePiWelcome } from '@/components/MobilePiWelcome';
import { Ticker } from '@/components/ui/ticker';
import { Business } from '@/lib/types';
import { useRouter } from 'next/navigation';
import AssetsTab from '@/components/tabs/AssetsTab';
import PoolTab from '@/components/tabs/PoolTab';
import TradesHistoryTab from '@/components/tabs/TradesHistoryTab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Simple 60s localStorage cache helpers
const CACHE_TTL_MS = 1_200_000; // 20 minutes
function getCachedItem<T = any>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.ts !== 'number') return null;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data as T;
  } catch {
    return null;
  }
}

async function withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = getCachedItem<T>(key);
  if (cached) return cached;
  const data = await fetcher();
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch {}
  return data;
}

interface ApiDataItem {
  _id: string;
  Name: string;
  Description?: string;
  identifier: string;
  Website?: string;
  updatedAt: string;
  Logo?: string;
  Rank?: number;
  Category?: string;
  Balance?: string;
}


const categories = ['All', 'DeFi', 'NFTs', 'Gaming', 'Social', 'CEX', 'Core Team'];

const TableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 bg-card/50 rounded-lg animate-pulse">
        <div className="w-8 h-4 bg-muted rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-3 bg-muted rounded w-1/6"></div>
        </div>
        <div className="w-20 h-4 bg-muted rounded"></div>
        <div className="w-24 h-4 bg-muted rounded"></div>
        <div className="w-16 h-4 bg-muted rounded"></div>
        <div className="w-16 h-4 bg-muted rounded"></div>
      </div>
    ))}
  </div>
);

const DataCard = ({ title, value, icon: Icon, color, loading }: { title: string, value: string, icon: React.ElementType, color: string, loading: boolean }) => (
  <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${color}`} />
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-8 bg-muted/50 rounded-md animate-pulse w-3/4"></div>
      ) : (
        <div className="text-2xl sm:text-3xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);

export function BuildOnPiContent() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [totalHoldings, setTotalHoldings] = useState(0);
  const [totalMarketCap, setTotalMarketCap] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState<'rank' | 'holdings' | 'marketCap' | 'volume24h'>('holdings');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [piPrice, setPiPrice] = useState(0);
  const [latestBlock, setLatestBlock] = useState(0);
  const [circulatingSupply, setCirculatingSupply] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [totalLockedPi, setTotalLockedPi] = useState(0);
  const [tps, setTps] = useState(0);
  const [twentyFourHourHigh, setTwentyFourHourHigh] = useState(0);


  const { isAuthenticated } = usePiNetwork();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const router = useRouter();
  const [tab, setTab] = useState<string>('build');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const v = params.get('tab');
    setTab(Array.isArray(v) ? v[0] : (v || 'build'));
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  }, [tab]);

  useEffect(() => {
    if (isMobile && !isAuthenticated && !localStorage.getItem('hasVisitedBuildOnPi')) {
      setShowAuthPopup(true);
      localStorage.setItem('hasVisitedBuildOnPi', 'true');
    }
  }, [isMobile, isAuthenticated]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Check if we have cached data before showing loading
        const hasCachedData = getCachedItem('addr_cex') && 
                              getCachedItem('addr_core') && 
                              getCachedItem('addr_gen') &&
                              getCachedItem('okx_market') &&
                              getCachedItem('supply') &&
                              getCachedItem('latest_block') &&
                              getCachedItem('tps');
        
        // Only show loading if we don't have cached data
        if (!hasCachedData) {
          setLoading(true);
        }
        
        const [cexRes, coreTeamRes, generatedRes, piPriceRes, supplyRes, latestBlockRes, tpsRes] = await Promise.all([
          withCache('addr_cex', async () => (await fetch('/api/addresses/cex')).json()),
          withCache('addr_core', async () => (await fetch('/api/addresses/core-team')).json()),
          withCache('addr_gen', async () => (await fetch('/api/addresses/generated')).json()),
          withCache('okx_market', () => okx.getMarketData()),
          withCache('supply', () => socialchain.getSupply()),
          withCache('latest_block', () => horizon.getLatestBlock()),
          withCache('tps', () => horizon.getTps()),
        ]);

        const cexData = cexRes;
        const coreTeamData = coreTeamRes;
        const generatedData = generatedRes;

        // Debug logging
        console.log('🔍 API Response Debug:');
        console.log('CEX Data:', cexData);
        console.log('Core Team Data:', coreTeamData);
        console.log('Generated Data:', generatedData);

        const newPiPrice = parseFloat(piPriceRes.idxPx);
        let currentPiPrice = piPrice;
        if (newPiPrice > 0) {
          setPiPrice(newPiPrice);
          currentPiPrice = newPiPrice;
        }

        setLatestBlock(latestBlockRes);
        setCirculatingSupply(supplyRes.total_circulating_supply);
        setTotalSupply(supplyRes.total_supply);
        setTotalLockedPi(supplyRes.total_locked);
        setTps(tpsRes);
        setTwentyFourHourHigh(parseFloat(piPriceRes.high24h) || 0);

        const allAddresses = [
          ...(cexData.data || []).map((item: ApiDataItem) => item.identifier),
          ...(coreTeamData.data || []).map((item: ApiDataItem) => item.identifier),
          ...(generatedData.data || []).map((item: ApiDataItem) => item.identifier),
        ].filter(Boolean);

        console.log('🔍 Fetching balances for addresses:', allAddresses.length);
        let balanceData = [];
        let balanceMap = new Map();
        
        try {
          balanceData = await horizon.getBalances(allAddresses);
          console.log('🔍 Balance data received:', balanceData);
          balanceMap = new Map(balanceData.map(item => [item.Address, item.Balance]));
          console.log('🔍 Balance map created:', balanceMap);
        } catch (balanceError) {
          console.warn('⚠️ Balance fetching failed, using zero balances:', balanceError);
          // Continue with zero balances
        }

        const processApiData = (data: ApiDataItem[], category: string) => data.map((item: ApiDataItem) => {
          const balance = balanceMap.get(item.identifier) || 0;
          const marketCap = balance * currentPiPrice;
          return {
            _id: item._id,
            name: item.Name,
            description: item.Description || '',
            category: category === 'Generated' ? item.Category || 'Generated' : category,
            totalHoldings: balance,
            walletAddress: item.identifier,
            founders: [],
            website: item.Website,
            lastUpdated: item.updatedAt,
            status: balance > 0 ? 'active' : 'inactive',
            marketCap: marketCap,
            volume24h: balance * 0.1, // Placeholder
            priceChange24h: 0,  
            netPiChange24h: 0,  
            logo: item.Logo,
            rank: item.Rank || 0,
          } as Business;
        });

        const allBusinesses = [
          ...processApiData(cexData.data || [], 'CEX'),
          ...processApiData(coreTeamData.data || [], 'Core Team'),
          ...processApiData(generatedData.data || [], 'Generated'),
        ];

        // Debug logging
        console.log('🔍 Processed Businesses:', allBusinesses);
        console.log('🔍 Total businesses count:', allBusinesses.length);

        const totalHoldingsSum = allBusinesses.reduce((sum, b) => sum + b.totalHoldings, 0);
        const totalMarketCapSum = allBusinesses.reduce((sum, b) => sum + b.marketCap, 0);
        const activeProjectsCount = allBusinesses.filter(b => b.status === 'active').length;

        setBusinesses(allBusinesses);
        setFilteredBusinesses(allBusinesses);
        setTotalHoldings(totalHoldingsSum);
        setTotalMarketCap(totalMarketCapSum);
        setActiveProjects(activeProjectsCount);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        console.error('❌ Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    let filtered = [...businesses];
    if (searchTerm) {
      filtered = filtered.filter(b => b.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(b => b.category === selectedCategory);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'holdings': comparison = b.totalHoldings - a.totalHoldings; break;
        case 'marketCap': comparison = b.marketCap - a.marketCap; break;
        case 'rank': comparison = (a.rank || Infinity) - (b.rank || Infinity); break;
        default: comparison = (a.name || '').localeCompare(b.name || '');
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });

    // Debug logging
    console.log('🔍 Filtering Debug:');
    console.log('Original businesses count:', businesses.length);
    console.log('Filtered businesses count:', filtered.length);
    console.log('Selected category:', selectedCategory);
    console.log('Search term:', searchTerm);

    setFilteredBusinesses(filtered);
  }, [businesses, searchTerm, selectedCategory, sortBy, sortOrder]);

  // Display all projects without pagination

  const formatHoldings = (h: number) => h >= 1e6 ? `${(h / 1e6).toFixed(1)}M Pi` : h >= 1e3 ? `${(h / 1e3).toFixed(1)}K Pi` : `${h.toLocaleString()} Pi`;
  const formatCurrency = (a: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(a);

  const metrics = [
    { id: 'piPrice', title: 'Pi Price', value: `$${piPrice.toFixed(2)}`, icon: DollarSign, color: 'text-green-500' },
    { id: 'latestBlock', title: 'Latest Block', value: latestBlock.toLocaleString(), icon: Hash, color: 'text-emerald-500' },
    { id: 'circulatingSupply', title: 'Circulating Supply', value: `${(circulatingSupply / 1e9).toFixed(2)}B`, icon: Globe, color: 'text-purple-500' },
    { id: 'totalSupply', title: 'Total Supply', value: `${(totalSupply / 1e9).toFixed(2)}B`, icon: Box, color: 'text-yellow-500' },
    { id: 'totalLockedPi', title: 'Total Locked Pi', value: `${(totalLockedPi / 1e9).toFixed(2)}B`, icon: Lock, color: 'text-red-500' },
    { id: 'tps', title: 'TPS', value: tps.toFixed(2), icon: Zap, color: 'text-emerald-500' },
    { id: '24hHigh', title: '24h High', value: `$${twentyFourHourHigh.toFixed(2)}`, icon: TrendingUp, color: 'text-pink-500' },
  ];

  const topGainers = [...businesses]
    .filter(b => b.netPiChange24h > 0)
    .sort((a, b) => b.netPiChange24h - a.netPiChange24h)
    .slice(0, 3);

  const topLosers = [...businesses]
    .filter(b => b.netPiChange24h < 0)
    .sort((a, b) => a.netPiChange24h - b.netPiChange24h)
    .slice(0, 3);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Spinner /></div>;
  }

  const handleSort = (column: 'rank' | 'holdings' | 'marketCap' | 'volume24h') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <>
      {showAuthPopup && <MobilePiWelcome onClose={() => setShowAuthPopup(false)} />}
      <div className="min-h-screen bg-background container mx-auto px-4 pt-6 pb-28">
        
        <div className="mb-4">
          <Ticker items={metrics.map(m => ({ id: m.id, title: m.title, value: m.value }))} />
        </div>

        <div className="mb-4">
          <Card>
            <CardContent className="grid grid-cols-2 gap-4 items-center">
              {/* Column 1 */}
              <div className="space-y-2">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Pi Price</p>
                  <p className="font-semibold text-base sm:text-lg text-orange-600 dark:text-orange-400">{`$${piPrice.toFixed(2)}`}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Holdings</p>
                  <p className="font-semibold text-base sm:text-lg text-emerald-600 dark:text-emerald-400">{formatHoldings(totalHoldings)}</p>
                </div>
              </div>
              {/* Column 2 (Projects/Valuation) */}
              <div className="space-y-2 text-right">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Projects</p>
                  <p className="font-semibold text-base sm:text-lg text-foreground">{filteredBusinesses.length}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Valuation</p>
                  <p className="font-semibold text-base sm:text-lg text-green-600 dark:text-green-400">{formatCurrency(totalMarketCap)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div>
            <TabsList className="sticky top-0 z-[40] bg-card/95 backdrop-blur border-b border-border flex gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none]">
              <TabsTrigger value="build" className="basis-1/4 shrink-0">Dapps</TabsTrigger>
              <TabsTrigger value="assets" className="basis-1/4 shrink-0">Coins</TabsTrigger>
              <TabsTrigger value="pool" className="basis-1/4 shrink-0">Liquidity Pool</TabsTrigger>
              <TabsTrigger value="trades-history" className="basis-1/4 shrink-0">Trx History</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="build">
            <div className="mb-3">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-3 py-2 border border-input rounded-md bg-background text-foreground">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-2 py-2 text-xs sm:text-sm">#</TableHead>
                    <TableHead className="px-2 py-2 text-xs sm:text-sm">Project</TableHead>
                    <TableHead className="px-2 py-2 text-xs sm:text-sm text-right">Holdings / M.Cap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.map((b, i) => (
                    <TableRow key={b._id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/build-on-pi/${b._id}`)}>
                                            <TableCell className="px-2 py-2 text-xs sm:text-sm">{i + 1}</TableCell>
                      <TableCell className="px-2 py-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          {b.logo && <img src={b.logo} alt={`${b.name} logo`} className="h-6 w-6 rounded-full" />}
                          <div className="flex flex-col">
                            <span className="font-medium">{b.name}</span>
                            <span className="text-muted-foreground text-xs">{b.category}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-2 py-2 text-xs sm:text-sm text-right">
                        <div className="font-medium">{formatHoldings(b.totalHoldings)} Pi</div>
                        <div className="text-green-600 dark:text-green-400 font-semibold">{formatCurrency(b.marketCap)}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="assets"><AssetsTab /></TabsContent>
          <TabsContent value="pool"><PoolTab /></TabsContent>
          <TabsContent value="trades-history"><TradesHistoryTab /></TabsContent>
        </Tabs>
        {/* Spacer to keep last rows above mobile bottom nav */}
        <div className="h-24 lg:hidden" />
 

            {filteredBusinesses.length === 0 && !loading && (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No projects found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </div>
            )}
      </div>
    </>
  );
}

export default function BuildOnPiPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Spinner /></div>}>
      <BuildOnPiContent />
    </Suspense>
  );
}
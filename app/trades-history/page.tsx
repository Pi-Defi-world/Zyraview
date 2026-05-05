"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface TradePrice {
  n?: string;
  d?: string;
}

interface Trade {
  id?: string;
  paging_token?: string;
  ledger_close_time?: string;
  trade_type?: string;
  base_offer_id?: string;
  base_account?: string;
  base_amount?: string;
  base_asset_type?: string;
  base_asset_code?: string;
  base_asset_issuer?: string;
  counter_offer_id?: string;
  counter_account?: string;
  counter_amount?: string;
  counter_asset_type?: string;
  counter_asset_code?: string;
  counter_asset_issuer?: string;
  base_is_seller?: boolean;
  price?: TradePrice;
  _links?: {
    self?: { href?: string };
    base?: { href?: string };
    counter?: { href?: string };
    operation?: { href?: string };
  };
}

interface TradesApiResponse {
  _links: {
    self: { href: string };
    next?: { href: string };
    prev?: { href: string };
  };
  _embedded: {
    records: Trade[];
  };
}

export default function TradeHistory() {
  const [tradesData, setTradesData] = useState<TradesApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);

  // 60s cache helpers
  const CACHE_TTL_MS = 60_000;
  const getCached = (key: string) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.ts !== 'number') return null;
      if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
      return parsed.data as TradesApiResponse;
    } catch { return null; }
  };
  const setCached = (key: string, data: any) => {
    try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch {}
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    if (tradesData?._embedded?.records) {
      const filtered = tradesData._embedded.records.filter(trade =>
        trade.base_asset_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.counter_asset_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.base_account?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.counter_account?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTrades(filtered);
    }
  }, [tradesData, searchQuery]);

  const fetchTrades = async (url?: string) => {
    try {
      setLoading(true);
      const apiUrl = url || 'https://api.testnet.minepi.com/trades?limit=50&order=desc';
      const cacheKey = `trades_${btoa(apiUrl)}`;
      const cached = getCached(cacheKey);
      if (cached) {
        setTradesData(cached);
        setLoading(false);
        return;
      }
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setCached(cacheKey, data);
      setTradesData(data);
      setLoading(false);
    } catch (err) {
      setError(`Failed to fetch trades data: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (tradesData?._links?.next) {
      fetchTrades(tradesData._links.next.href);
    }
  };

  const handlePrevPage = () => {
    if (tradesData?._links?.prev) {
      fetchTrades(tradesData._links.prev.href);
    }
  };

  const formatNumber = (num?: string): string => {
    if (!num || num === '') return '0';
    const number = parseFloat(num);
    if (isNaN(number)) return '0';
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 7
    });
  };

  const formatPrice = (price?: TradePrice): string => {
    if (!price || !price.n || !price.d) return '0';
    const n = parseFloat(price.n);
    const d = parseFloat(price.d);
    if (isNaN(n) || isNaN(d) || d === 0) return '0';
    const priceValue = n / d;
    return priceValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 7
    });
  };

  const formatAsset = (assetType?: string, assetCode?: string): string => {
    if (!assetType) return 'Unknown';
    if (assetType === 'native') return 'PI';
    return assetCode || 'Unknown';
  };

  const formatDateTime = (dateTime?: string): string => {
    if (!dateTime) return 'Unknown';
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTradeTypeColor = (tradeType?: string): string => {
    if (!tradeType) return 'bg-gray-100 text-gray-800';
    switch (tradeType) {
      case 'orderbook':
        return 'bg-emerald-100 text-emerald-800';
      case 'liquidity_pool':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTradeTypeLabel = (tradeType?: string): string => {
    if (!tradeType) return 'Unknown';
    switch (tradeType) {
      case 'orderbook':
        return 'Order Book';
      case 'liquidity_pool':
        return 'Liquidity Pool';
      default:
        return tradeType;
    }
  };

  if (loading) return <div className="py-6 sm:py-8 px-4 text-sm sm:text-base text-muted-foreground text-center">Loading trades…</div>;
  if (error) return <div className="py-6 sm:py-8 px-4 text-sm sm:text-base text-red-500 text-center break-words">{error}</div>;
  if (!tradesData) return <div className="py-6 sm:py-8 px-4 text-sm sm:text-base text-center">No trades data</div>;

  return (
    <div className="w-full px-2 sm:px-4">
      <div className="mb-4 sm:mb-6">
        <Input
          placeholder="Search trades by asset or account..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-md text-sm sm:text-base"
        />
      </div>
      <div className="overflow-x-auto -mx-2 sm:mx-0 rounded-lg border border-border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm whitespace-nowrap">Time</TableHead>
              <TableHead className="text-xs sm:text-sm whitespace-nowrap">Type</TableHead>
              <TableHead className="text-xs sm:text-sm whitespace-nowrap">Base</TableHead>
              <TableHead className="text-xs sm:text-sm whitespace-nowrap">Counter</TableHead>
              <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                  {searchQuery ? "No trades found matching your search." : "No trades available."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTrades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    {formatDateTime(trade.ledger_close_time)}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${getTradeTypeColor(trade.trade_type)}`}>
                      {getTradeTypeLabel(trade.trade_type)}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                      <span className="font-medium">{formatNumber(trade.base_amount)}</span>
                      <span className="text-muted-foreground">{formatAsset(trade.base_asset_type, trade.base_asset_code)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                      <span className="font-medium">{formatNumber(trade.counter_amount)}</span>
                      <span className="text-muted-foreground">{formatAsset(trade.counter_asset_type, trade.counter_asset_code)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap">
                    {formatPrice(trade.price)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground">
        <span className="text-center sm:text-left">
          Showing {filteredTrades.length} of {tradesData._embedded.records.length} trades
        </span>
        <div className="flex gap-2 justify-center sm:justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={!tradesData._links.prev} 
            onClick={handlePrevPage}
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={!tradesData._links.next} 
            onClick={handleNextPage}
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}   
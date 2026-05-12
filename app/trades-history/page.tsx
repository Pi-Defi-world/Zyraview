"use client";

import { useState, useCallback } from "react";
import TradesHistoryTab from "@/components/tabs/TradesHistoryTab";
import { PageHeader } from "@/components/PageHeader";
import { SummaryStats } from "@/components/SummaryStats";
import { ArrowLeftRight, TrendingUp, Wallet, BarChart3 } from "lucide-react";

interface Trade {
  base_amount?: string;
  counter_amount?: string;
  base_asset_type?: string;
  counter_asset_type?: string;
  price?: { n?: string; d?: string };
}

interface TradesApiResponse {
  _embedded: { records: Trade[] };
}

export default function TradesHistory() {
  const [stats, setStats] = useState({ total: 0, volume: 0, tradesWithPrice: 0 });
  const [initialLoading, setInitialLoading] = useState(true);

  const handleLoad = useCallback((data: TradesApiResponse) => {
    const records = data._embedded?.records || [];
    const total = records.length;
    const volume = records.reduce((s, t) => s + parseFloat(t.base_amount || "0") + parseFloat(t.counter_amount || "0"), 0);
    const tradesWithPrice = records.filter((t) => t.price?.n && t.price?.d).length;
    setStats({ total, volume, tradesWithPrice });
    setInitialLoading(false);
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl mx-auto">
      <PageHeader
        title="Trades"
        description="Recent trades on the Pi Network — track orderbook and liquidity pool swaps."
      >
        {!initialLoading && (
          <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            {stats.total} trades
          </div>
        )}
      </PageHeader>

      {!initialLoading && (
        <SummaryStats
          stats={[
            { label: "Total Trades", value: stats.total.toLocaleString(), icon: <ArrowLeftRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> },
            { label: "Total Volume", value: stats.volume.toLocaleString(undefined, { maximumFractionDigits: 2 }), icon: <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> },
            { label: "With Price", value: stats.tradesWithPrice.toLocaleString(), icon: <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> },
            { label: "Unique Pairs", value: "—", icon: <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> },
          ]}
        />
      )}

      <TradesHistoryTab onLoad={handleLoad} />
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import PoolTab from "@/components/tabs/PoolTab";
import { PageHeader } from "@/components/PageHeader";
import { SummaryStats } from "@/components/SummaryStats";
import { Droplets, Users, BarChart3, RefreshCw } from "lucide-react";

interface Reserve {
  amount?: string;
}

interface Pool {
  id?: string;
  total_trustlines?: string;
  total_shares?: string;
  reserves?: Reserve[];
}

export default function Pools() {
  const [stats, setStats] = useState({ total: 0, trustlines: 0, reservesCount: 0, sharesTotal: 0 });
  const [initialLoading, setInitialLoading] = useState(true);

  const handlePoolsLoad = useCallback((pools: Pool[]) => {
    const total = pools.length;
    const trustlines = pools.reduce((sum, p) => sum + parseInt(p.total_trustlines || "0"), 0);
    const sharesTotal = pools.reduce((sum, p) => sum + parseFloat(p.total_shares || "0"), 0);
    const reservesCount = pools.reduce((sum, p) => sum + (p.reserves?.length || 0), 0);
    setStats({ total, trustlines, reservesCount, sharesTotal });
    setInitialLoading(false);
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl mx-auto">
      <PageHeader
        title="Liquidity Pools"
        description="View liquidity pools on the Pi Network — track reserves, trustlines, and shares."
      >
        <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
          {!initialLoading && `${stats.total} pools loaded`}
        </div>
      </PageHeader>

      {!initialLoading && (
        <SummaryStats
          stats={[
            { label: "Total Pools", value: stats.total.toLocaleString(), icon: <Droplets className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> },
            { label: "Total Trustlines", value: stats.trustlines.toLocaleString(), icon: <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> },
            { label: "Total Shares", value: stats.sharesTotal.toLocaleString(undefined, { maximumFractionDigits: 0 }), icon: <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> },
            { label: "Reserve Entries", value: stats.reservesCount.toLocaleString(), icon: <RefreshCw className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> },
          ]}
        />
      )}

      <PoolTab onLoad={handlePoolsLoad} />
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

type HeroPayload = {
  priceUsd: number;
  market_cap_usd: number;
  fdv_usd: number;
  updatedAt?: string;
};

const POLL_INTERVAL_MS = 5000;

function fmtUsd(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 4 }).format(n);
}

function fmtLarge(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(2)}`;
}

export function LivePriceWidget({ initial }: { initial?: HeroPayload }) {
  const [data, setData] = useState<HeroPayload | null>(initial ?? null);
  const [live, setLive] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    async function fetchPrice() {
      try {
        const res = await fetch('/api/v2/home/hero', { cache: 'no-store' });
        const json = await res.json();
        if (json.success && json.data && mounted.current) {
          setData({
            priceUsd: json.data.priceUsd ?? 0,
            market_cap_usd: json.data.market_cap_usd ?? 0,
            fdv_usd: json.data.fdv_usd ?? 0,
            updatedAt: json.updatedAt ?? undefined,
          });
          setLive(true);
        }
      } catch {
        // keep previous data
      }
    }

    fetchPrice();
    const id = setInterval(fetchPrice, POLL_INTERVAL_MS);

    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, []);

  const d = data;

  return (
    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-base sm:text-lg font-bold text-foreground">
          {d ? fmtUsd(d.priceUsd) : '\u2014'}
        </span>
        {live && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            LIVE
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          MC: <span className="font-medium text-foreground">{d ? fmtLarge(d.market_cap_usd) : '\u2014'}</span>
        </span>
        <span>
          FDV: <span className="font-medium text-foreground">{d ? fmtLarge(d.fdv_usd) : '\u2014'}</span>
        </span>
      </div>
    </div>
  );
}

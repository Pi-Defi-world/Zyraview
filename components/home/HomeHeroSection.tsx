import { Card, CardContent } from '@/components/ui/card';
import { fetchSnapshot } from '@/lib/server-fetch';
import { DollarSign, Hash, Globe, Box, Lock, Zap, TrendingUp } from 'lucide-react';

type HeroPayload = {
  priceUsd: number;
  total_circulating_supply: number;
  total_supply: number;
  total_locked: number;
  latest_block: number;
  tps: number;
  market_cap_usd?: number;
};

const metricConfig = [
  { key: 'price', label: 'Pi Price', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/20' },
  { key: 'block', label: 'Latest Block', icon: Hash, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { key: 'circ', label: 'Circulating', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20' },
  { key: 'supply', label: 'Total Supply', icon: Box, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20' },
  { key: 'locked', label: 'Locked Pi', icon: Lock, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20' },
  { key: 'tps', label: 'TPS (est.)', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { key: 'mcap', label: 'Market Cap', icon: TrendingUp, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/20' },
] as const;

export async function HomeHeroSection() {
  const res = await fetchSnapshot<HeroPayload>('hero', 30);
  if (!res.success || !res.data) {
    return (
      <section className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground text-center">
        Market overview temporarily unavailable. Ensure the API server is running and snapshots have warmed.
      </section>
    );
  }

  const d = res.data;
  const fmtUsd = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
  const fmtB = (n: number) => `${(n / 1e9).toFixed(2)}B`;

  const values: Record<string, string> = {
    price: fmtUsd(d.priceUsd),
    block: String(d.latest_block ?? '—'),
    circ: fmtB(d.total_circulating_supply),
    supply: fmtB(d.total_supply),
    locked: fmtB(d.total_locked),
    tps: typeof d.tps === 'number' ? d.tps.toFixed(2) : '—',
    mcap: d.market_cap_usd ? fmtUsd(d.market_cap_usd) : '—',
  };

  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
        {metricConfig.map((m) => (
          <Card key={m.key} className="border-border/60 bg-card/40 backdrop-blur hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
                  {m.label}
                </span>
                <div className={`rounded-full p-1 ${m.bg}`}>
                  <m.icon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${m.color}`} />
                </div>
              </div>
              <p className="text-sm sm:text-base font-bold text-foreground truncate">{values[m.key]}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {res.updatedAt && (
        <p className="text-[11px] text-muted-foreground text-right mt-1.5">
          Updated {new Date(res.updatedAt).toLocaleString()}
        </p>
      )}
    </section>
  );
}

import { fetchSnapshot } from '@/lib/server-fetch';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type HeroPayload = {
  priceUsd: number;
  market_cap_usd: number;
  fdv_usd: number;
  total_circulating_supply: number;
  total_supply: number;
  total_locked: number;
  latest_block: number;
  tps: number;
  high24hUsd?: number;
  low24hUsd?: number;
};

export async function HomeMarketSection() {
  const res = await fetchSnapshot<HeroPayload>('hero', 30);
  if (!res.success || !res.data) return null;

  const d = res.data;
  const fmtUsd = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
  const fmtB = (n: number) => `${(n / 1e9).toFixed(2)}B`;
  const fmtFull = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 });

  return (
    <section className="grid gap-3 sm:gap-4 lg:grid-cols-3">
      {/* Price Card — prominent */}
      <Card className="lg:col-span-1 border-border/60 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/10 dark:to-green-950/10">
        <CardContent className="p-4 sm:p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Pi Price</p>
          <p className="text-3xl sm:text-4xl font-bold text-foreground">{fmtUsd(d.priceUsd)}</p>
          <div className="flex items-center gap-3 mt-2 text-xs sm:text-sm text-muted-foreground">
            <span>24h H: {d.high24hUsd ? fmtUsd(d.high24hUsd) : '—'}</span>
            <span>24h L: {d.low24hUsd ? fmtUsd(d.low24hUsd) : '—'}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border/40 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Market Cap</span>
              <p className="font-semibold text-foreground">{fmtUsd(d.market_cap_usd)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">FDV</span>
              <p className="font-semibold text-foreground">{fmtUsd(d.fdv_usd)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supply Details */}
      <Card className="lg:col-span-1 border-border/60 bg-card/40">
        <CardContent className="p-4 sm:p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Supply</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Circulating</span>
              <span className="text-sm font-semibold">{fmtB(d.total_circulating_supply)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${(d.total_circulating_supply / d.total_supply) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Supply</span>
              <span className="text-sm font-semibold">{fmtB(d.total_supply)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Locked</span>
              <span className="text-sm font-semibold">{fmtB(d.total_locked)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Unlocked %</span>
              <span className="text-sm font-semibold">
                {((1 - d.total_locked / d.total_supply) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Activity */}
      <Card className="lg:col-span-1 border-border/60 bg-card/40">
        <CardContent className="p-4 sm:p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Network</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Latest Block</span>
              <span className="text-sm font-semibold font-mono">#{d.latest_block?.toLocaleString() || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">TPS (est.)</span>
              <span className="text-sm font-semibold">{typeof d.tps === 'number' ? d.tps.toFixed(2) : '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Circulating / Locked</span>
              <span className="text-sm font-semibold">
                {((d.total_circulating_supply - d.total_locked) / 1e9).toFixed(2)}B / {fmtB(d.total_locked)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Supply Utilization</span>
              <span className="text-sm font-semibold">
                {((d.total_circulating_supply / d.total_supply) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

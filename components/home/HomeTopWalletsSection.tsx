import Link from 'next/link';
import { fetchSnapshot } from '@/lib/server-fetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, ExternalLink, ArrowUpRight } from 'lucide-react';

type TopWalletsPayload = {
  wallets: Array<{
    identifier: string;
    name: string;
    category: 'CEX' | 'Core Team' | 'Generated';
    balance: number | null;
  }>;
};

const categoryColors: Record<string, string> = {
  CEX: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
  'Core Team': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  Generated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
};

export async function HomeTopWalletsSection() {
  const res = await fetchSnapshot<TopWalletsPayload>('top-wallets', 300);
  if (!res.success || !res.data) return null;

  const wallets = res.data.wallets.slice(0, 25);
  const totalBalance = wallets.reduce((s, w) => s + (w.balance || 0), 0);

  return (
    <section className="grid gap-3 sm:gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 border-border/60 bg-card/40">
        <CardHeader className="pb-2 px-4 pt-4 sm:px-5 sm:pt-5 flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4 text-emerald-500" />
            Top Tracked Wallets
          </CardTitle>
          <Link href="/pct-wallet-monitor" className="text-xs text-primary hover:underline shrink-0">
            View all
          </Link>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="overflow-x-auto -mx-4 sm:-mx-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-8">#</TableHead>
                  <TableHead className="text-xs">Wallet</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-right text-xs">Balance (Pi)</TableHead>
                  <TableHead className="text-right text-xs">% of Tracked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.map((w, i) => (
                  <TableRow key={w.identifier}>
                    <TableCell className="text-xs text-muted-foreground font-mono">{i + 1}</TableCell>
                    <TableCell className="max-w-[180px] sm:max-w-[220px] truncate">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/account/${w.identifier}`} className="text-primary hover:underline text-xs sm:text-sm font-medium truncate">
                          {w.name}
                        </Link>
                        <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] px-1.5 py-0.5 ${categoryColors[w.category] || ''}`}>
                        {w.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs sm:text-sm font-medium">
                      {typeof w.balance === 'number'
                        ? w.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {totalBalance > 0 ? `${((w.balance || 0) / totalBalance * 100).toFixed(1)}%` : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats sidebar */}
      <Card className="lg:col-span-1 border-border/60 bg-card/40">
        <CardHeader className="pb-2 px-4 pt-4 sm:px-5 sm:pt-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            Wallet Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tracked Wallets</span>
            <span className="font-semibold">{wallets.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Tracked Balance</span>
            <span className="font-semibold">{totalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} Pi</span>
          </div>
          <div className="pt-2 border-t border-border/30">
            {(['CEX', 'Core Team', 'Generated'] as const).map((cat) => {
              const count = wallets.filter((w) => w.category === cat).length;
              const bal = wallets.filter((w) => w.category === cat).reduce((s, w) => s + (w.balance || 0), 0);
              return (
                <div key={cat} className="flex justify-between py-1">
                  <span className="text-muted-foreground">{cat}</span>
                  <span className="font-medium text-xs">
                    {count} wallets / {bal.toLocaleString(undefined, { maximumFractionDigits: 0 })} Pi
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

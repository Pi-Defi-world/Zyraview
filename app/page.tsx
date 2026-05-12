import { Suspense } from 'react';
import { HomeHeroSection } from '@/components/home/HomeHeroSection';
import { HomeMarketSection } from '@/components/home/HomeMarketSection';
import { HomeEcosystemSection } from '@/components/home/HomeEcosystemSection';
import { HomePulseSection } from '@/components/home/HomePulseSection';
import { HomeTopWalletsSection } from '@/components/home/HomeTopWalletsSection';

export default function Page() {
  return (
    <main className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto space-y-5 sm:space-y-7 lg:space-y-9">
      {/* Live Market Stats — compact grid like CMC */}
      <Suspense fallback={<SectionSkeleton className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2" count={7} />}>
        <HomeHeroSection />
      </Suspense>

      {/* Market Deep Dive — price, supply, network */}
      <section>
        <SectionHeading title="Market Overview" description="Pi price, supply breakdown, and network activity" />
        <Suspense fallback={<SectionSkeleton className="grid gap-3 lg:grid-cols-3" count={3} />}>
          <HomeMarketSection />
        </Suspense>
      </section>

      {/* Ecosystem — communities leaderboard */}
      <section>
        <SectionHeading title="Ecosystem" description="Community stats and largest communities" />
        <Suspense fallback={<SectionSkeleton className="grid gap-3 lg:grid-cols-3" count={3} />}>
          <HomeEcosystemSection />
        </Suspense>
      </section>

      {/* Network Pulse — flows & moves */}
      <section>
        <SectionHeading title="Network Pulse" description="24h balance flows and wallet moves" />
        <Suspense fallback={<SectionSkeleton className="grid gap-3 lg:grid-cols-3" count={3} />}>
          <HomePulseSection />
        </Suspense>
      </section>

      {/* Top Wallets — ranked tracked wallets */}
      <section>
        <SectionHeading title="Top Wallets" description="Highest tracked balances on the Pi Network" />
        <Suspense fallback={<SectionSkeleton className="grid gap-3 lg:grid-cols-3" count={2} />}>
          <HomeTopWalletsSection />
        </Suspense>
      </section>
    </main>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-3 sm:mb-4">
      <h2 className="text-sm sm:text-base font-heading font-bold text-foreground">{title}</h2>
      <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{description}</p>
    </div>
  );
}

function SectionSkeleton({ className, count }: { className: string; count: number }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card/40 p-4 animate-pulse">
          <div className="h-3 w-20 bg-muted rounded mb-2" />
          <div className="h-5 w-24 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

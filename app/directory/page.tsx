'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePageMetadata } from '@/context/pagemetadataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star } from 'lucide-react';

export default function DirectoryHubPage() {
  const { setHeading, setTitle, setDescription } = usePageMetadata();

  useEffect(() => {
    setHeading('Listing directory');
    setTitle('Listing directory | Zyraview');
    setDescription('Paid Pi Network community and influencer listings with live social stats.');
  }, [setHeading, setTitle, setDescription]);

  return (
    <div className="white-zone">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Listing directory</h1>
          <p className="text-muted-foreground">
            Communities and influencers submitted through Zyraview listings. Stats load from X and Telegram when configured on the server.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 text-left">
          <Link href="/directory/communities">
            <Card className="h-full bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-6 w-6 text-emerald-600" />
                  Communities
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Telegram member counts (when available) from your listing&apos;s public channel or group.
              </CardContent>
            </Card>
          </Link>
          <Link href="/directory/influencers">
            <Card className="h-full bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Star className="h-6 w-6 text-emerald-600" />
                  Influencers
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                X (Twitter) follower counts from the handle saved on each influencer listing.
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

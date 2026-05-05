'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePageMetadata } from '@/context/pagemetadataContext';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, ExternalLink, Users } from 'lucide-react';
import Link from 'next/link';

interface CommunitySocialStats {
  telegramUsername: string | null;
  telegram: { memberCount?: number | null; title?: string } | null;
  telegramError?: string;
}

interface CommunityListingRow {
  _id: string;
  name: string;
  description: string;
  category: string;
  website?: string;
  telegram?: string;
  discord?: string;
  socialStats?: CommunitySocialStats;
}

export default function DirectoryCommunitiesPage() {
  const { setHeading, setTitle, setDescription } = usePageMetadata();
  const [rows, setRows] = useState<CommunityListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.getCommunityDirectoryListings();
      if (res.success && Array.isArray(res.listings)) {
        setRows(res.listings as CommunityListingRow[]);
      } else {
        throw new Error((res as { error?: string }).error || 'Failed to load listings');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setHeading('Community listings');
    setTitle('Community listings | Zyraview');
    setDescription('Paid community directory with live Telegram member counts when available.');
  }, [setHeading, setTitle, setDescription]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="white-zone flex justify-center items-center py-16 gap-2">
        <Spinner />
        <span className="text-muted-foreground">Loading directory…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="white-zone max-w-lg mx-auto py-12 px-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-300">Could not load listings</p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={load}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalMembers = rows.reduce((sum, r) => {
    const n = r.socialStats?.telegram?.memberCount;
    return sum + (typeof n === 'number' ? n : 0);
  }, 0);

  return (
    <div className="white-zone">
      <div className="space-y-8 px-4 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-8 w-8 text-emerald-600" />
              Community listings
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Approved paid listings. Member counts use the Telegram Bot API when <code className="text-xs bg-muted px-1 rounded">TELEGRAM_BOT_TOKEN</code> is set and the chat is public.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/directory">All directories</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Listings</p>
              <p className="text-2xl font-bold">{rows.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total members (loaded)</p>
              <p className="text-2xl font-bold">{totalMembers.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">With Telegram</p>
              <p className="text-2xl font-bold">
                {rows.filter((r) => r.socialStats?.telegramUsername).length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Communities ({rows.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No approved community listings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Community</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead className="w-[140px]">Links</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => {
                      const user = r.socialStats?.telegramUsername;
                      const members = r.socialStats?.telegram?.memberCount;
                      const err = r.socialStats?.telegramError;
                      return (
                        <TableRow key={r._id}>
                          <TableCell>
                            <div className="font-medium">{r.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2 max-w-[280px]">{r.description}</div>
                            {err && user && (
                              <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">{err}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{r.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {typeof members === 'number' ? (
                                <span className="font-medium">{members.toLocaleString()}</span>
                              ) : user ? (
                                <span className="text-muted-foreground text-sm">—</span>
                              ) : (
                                <span className="text-muted-foreground text-sm">No Telegram</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {user && (
                                <Button variant="outline" size="sm" className="h-8" asChild>
                                  <a href={`https://t.me/${user}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Telegram
                                  </a>
                                </Button>
                              )}
                              {r.website && (
                                <Button variant="ghost" size="sm" className="h-8" asChild>
                                  <a href={r.website} target="_blank" rel="noopener noreferrer">
                                    Website
                                  </a>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

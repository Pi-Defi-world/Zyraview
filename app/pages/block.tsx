"use client";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/languagecontext";
import { usePageMetadata } from "@/context/pagemetadataContext";
import { horizon } from "@/api/horizon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";

const BlocksPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { setHeading, setTitle, setDescription } = usePageMetadata();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextLink, setNextLink] = useState("");
  const [prevLink, setPrevLink] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch blocks data
  const fetchBlocks = async (link = "", page = 1) => {
    try {
      setRefreshing(true);
      const response = await horizon.getLedgers(link);
      
      if (link === "" || link.indexOf("order=desc") > 0) {
        setBlocks(response._embedded.records);
        setNextLink(response._links.next.href);
        setPrevLink(response._links.prev.href);
        setCurrentPage(page);
      } else {
        setBlocks(response._embedded.records.reverse());
        setNextLink(response._links.prev.href);
        setPrevLink(response._links.next.href);
        setCurrentPage(page);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await fetchBlocks();
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  // Manual refresh function
  const handleRefresh = async () => {
    await fetchBlocks();
  };

  useEffect(() => {
    setHeading(String(t('blocks.heading')));
    setTitle(String(t('blocks.title')));
    setDescription(String(t('blocks.description')));
  }, [setTitle, setDescription, setHeading, t, language]);

  const handleNextPage = () => {
    if (nextLink) {
      fetchBlocks(nextLink, currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (prevLink) {
      fetchBlocks(prevLink, currentPage - 1);
    }
  };

  const formatAmount = (amount: number): string => {
    return amount.toLocaleString(language, { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading blocks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t('blocks.heading')}
            </h1>
            <p className="text-muted-foreground">
              {t('blocks.description')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-muted-foreground">
              Updated {formatLastUpdated(lastUpdated)}
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Blocks List */}
        <div className="space-y-4">
          {blocks.map((block) => (
            <Card key={block.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Block Number
                    </p>
                    <Link 
                      href={`/block/${block.sequence}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {block.sequence}
                    </Link>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Hash
                    </p>
                    <p className="font-mono text-sm">
                      {block.hash?.slice(0, 16)}...
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Transactions
                    </p>
                    <p className="font-medium">
                      {block.successful_transaction_count || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Created At
                    </p>
                    <p className="font-medium">
                      {new Date(block.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {blocks.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blocks found</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Page {currentPage}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handlePrevPage}
              disabled={!prevLink || refreshing}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={!nextLink || refreshing}
              variant="outline"
              size="sm"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlocksPage;

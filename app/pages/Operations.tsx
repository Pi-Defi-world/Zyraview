"use client";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/languagecontext";
import { usePageMetadata } from "@/context/pagemetadataContext";
import { horizon } from "@/api/horizon";
import { okx } from "@/api/okx";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import AccountLabel from "@/components/AccountLabel";
import { formatTime } from "@/utils/predicate";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const OperationsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { setHeading, setTitle, setDescription } = usePageMetadata();
  const [operations, setOperations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextLink, setNextLink] = useState("");
  const [prevLink, setPrevLink] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [piPriceUSD, setPiPriceUSD] = useState(0.0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch operations data
  const fetchOperations = async () => {
    try {
      setRefreshing(true);
      const operationsData = await horizon.getLatestOperations('', 10);
      setOperations(operationsData._embedded?.records || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching operations:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch Pi price
  const fetchPiPrice = async () => {
    try {
      const marketData = await okx.getMarketData();
      setPiPriceUSD(parseFloat(marketData.idxPx || '2.0'));
    } catch (error) {
      console.error('Error fetching Pi price:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await Promise.all([fetchOperations(), fetchPiPrice()]);
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  // Manual refresh function
  const handleRefresh = async () => {
    await Promise.all([fetchOperations(), fetchPiPrice()]);
  };

  useEffect(() => {
    setHeading(String(t('operations.heading')));
    setTitle(String(t('operations.title')));
    setDescription(String(t('operations.description')));
  }, [setTitle, setDescription, setHeading, language, t]);

  const formatAmount = (amount: number): string => {
    return amount.toLocaleString(language, { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
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
          <p className="text-muted-foreground">Loading operations...</p>
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
              {t('operations.heading')}
            </h1>
            <p className="text-muted-foreground">
              {t('operations.description')}
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

        {/* Operations List */}
        <div className="space-y-4">
          {operations.map((operation, index) => (
            <Card key={operation.id || index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="secondary">
                        {operation.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(operation.created_at)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {operation.from && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">From:</span>
                          <AccountLabel account={operation.from} shorten={true} />
                        </div>
                      )}
                      
                      {operation.to && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">To:</span>
                          <AccountLabel account={operation.to} shorten={true} />
                        </div>
                      )}
                      
                      {operation.amount && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Amount:</span>
                          <span className="text-sm">
                            {formatAmount(parseFloat(operation.amount) / 10_000_000)} π
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({formatCurrency((parseFloat(operation.amount) / 10_000_000) * piPriceUSD)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Link href={`/tx/${operation.transaction_hash}`}>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {operations.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No operations found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationsPage;

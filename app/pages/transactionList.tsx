"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useLanguage } from "@/context/languagecontext";
import { usePageMetadata } from "@/context/pagemetadataContext";
import { horizon } from "@/api/horizon";
import TransactionFilter from "./TransactionFilter";
import TransactionDetails from "./TransactionDetails";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
 

const TransactionList: React.FC = () => {
  const { t, language } = useLanguage();
  const { setHeading, setTitle, setDescription } = usePageMetadata();
  const [txNextLink, setTxNextLink] = useState("");
  const [txPrevLink, setTxPrevLink] = useState("");
  const [txPage, setTxPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch transactions data
  const fetchTransactions = async (link = "", page = 1) => {
    try {
      setRefreshing(true);
      const response = await horizon.getLatestTransactions(link, 20);
      
      if (link === "" || link.indexOf("order=desc") > 0) {
        setTransactions(response._embedded.records);
        setTxNextLink(response._links.next.href);
        setTxPrevLink(response._links.prev.href);
        setTxPage(page);
      } else {
        setTransactions(response._embedded.records.reverse());
        setTxNextLink(response._links.prev.href);
        setTxPrevLink(response._links.next.href);
        setTxPage(page);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await fetchTransactions();
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  // Manual refresh function
  const handleRefresh = async () => {
    await fetchTransactions();
  };

  useEffect(() => {
    setHeading(String(t('transactions.heading')));
    setTitle(String(t('transactions.title')));
    setDescription(String(t('transactions.description')));
  }, [setTitle, setDescription, setHeading, t, language]);

  const handleNextPage = () => {
    if (txNextLink) {
      fetchTransactions(txNextLink, txPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (txPrevLink) {
      fetchTransactions(txPrevLink, txPage - 1);
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
          <p className="text-muted-foreground">Loading transactions...</p>
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
              {t('transactions.heading')}
            </h1>
            <p className="text-muted-foreground">
              {t('transactions.description')}
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

        {/* Transaction Filter */}
        <Suspense fallback={<div className="mb-4"><Spinner className="h-6 w-6" /></div>}>
          <TransactionFilter />
        </Suspense>

        {/* Transactions List */}
        <div className="space-y-4">
          {transactions.map((tx) => (
            <TransactionDetails key={tx.id} hash={tx.hash} />
          ))}
        </div>

        {transactions.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Page {txPage}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handlePrevPage}
              disabled={!txPrevLink || refreshing}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={!txNextLink || refreshing}
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

export default TransactionList;

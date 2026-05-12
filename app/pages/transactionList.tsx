"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useLanguage } from "@/context/languagecontext";
import { usePageMetadata } from "@/context/pagemetadataContext";
import { horizon } from "@/api/horizon";
import TransactionFilter from "./TransactionFilter";
import { TransactionListRow, type HorizonTxListRecord } from "@/components/TransactionListRow";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, RefreshCw, FileText, CheckCircle, XCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SummaryStats } from "@/components/SummaryStats";
import { SkeletonTable } from "@/components/SkeletonTable";
import { Badge } from "@/components/ui/badge";

const TransactionList: React.FC = () => {
  const { t, language } = useLanguage();
  const { setHeading, setTitle, setDescription } = usePageMetadata();
  const [txNextLink, setTxNextLink] = useState("");
  const [txPrevLink, setTxPrevLink] = useState("");
  const [txPage, setTxPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<HorizonTxListRecord[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchTransactions = async (link = "", page = 1) => {
    try {
      setRefreshing(true);
      if (!link) {
        try {
          const r = await fetch("/api/v2/home/latest-transactions");
          const j = await r.json();
          if (j.success && j.data?.records?.length) {
            setTransactions(j.data.records as HorizonTxListRecord[]);
            const hl = j.data.horizonLinks as { next?: { href?: string }; prev?: { href?: string } } | undefined;
            setTxNextLink(hl?.next?.href || "");
            setTxPrevLink(hl?.prev?.href || "");
            setTxPage(page);
            setLastUpdated(new Date());
            return;
          }
        } catch {
          /* fallback horizon */
        }
      }
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

  const filteredTransactions = transactions.filter((tx) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "success") return tx.successful;
    if (statusFilter === "failed") return !tx.successful;
    return true;
  });

  const successCount = transactions.filter((tx) => tx.successful).length;
  const failedCount = transactions.filter((tx) => !tx.successful).length;

  const statusFilters = [
    { key: "all", label: "All" },
    { key: "success", label: "Success", count: successCount },
    { key: "failed", label: "Failed", count: failedCount },
  ];

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl mx-auto">
        <PageHeader title="Transactions" description="Browse recent transactions on the Pi Network." />
        <SkeletonTable rows={10} cols={5} />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl mx-auto">
      <PageHeader
        title={String(t('transactions.heading'))}
        description={String(t('transactions.description'))}
      >
        <div className="flex items-center gap-3">
          <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            Updated {formatLastUpdated(lastUpdated)}
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </PageHeader>

      <SummaryStats
        stats={[
          { label: "Total Transactions", value: transactions.length.toLocaleString(), icon: <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> },
          { label: "Successful", value: successCount.toLocaleString(), icon: <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> },
          { label: "Failed", value: failedCount.toLocaleString(), icon: <XCircle className="h-4 w-4 text-red-500" /> },
          { label: "Success Rate", value: transactions.length > 0 ? `${Math.round((successCount / transactions.length) * 100)}%` : "—", icon: <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> },
        ]}
      />

      {/* Status Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {statusFilters.map((f) => (
          <Badge
            key={f.key}
            variant={statusFilter === f.key ? "default" : "outline"}
            className="cursor-pointer px-3 py-1.5 text-xs sm:text-sm"
            onClick={() => setStatusFilter(f.key)}
          >
            {f.label}
            {"count" in f && ` (${f.count})`}
          </Badge>
        ))}
      </div>

      {/* Transaction Filter */}
      <Suspense fallback={<div className="mb-4"><Spinner className="h-6 w-6" /></div>}>
        <TransactionFilter />
      </Suspense>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hash</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Ops</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {statusFilter !== "all" ? "No transactions match the selected filter." : "No transactions found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TransactionListRow key={tx.id || tx.hash} tx={tx} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-muted-foreground">Page {txPage}</div>
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
  );
};

export default TransactionList;

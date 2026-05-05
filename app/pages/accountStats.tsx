"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/languagecontext";
import apiClient from '@/lib/api-client';
import { usePageMetadata } from "@/context/pagemetadataContext";
import { horizon } from "@/api/horizon";
import { okx } from "@/api/okx";
import { socialchain } from "@/api/socialchain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RefreshCw, TrendingUp, Users, Coins, Activity, Zap } from "lucide-react";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AccountStats: React.FC = () => {
  const { t, language } = useLanguage();
  const { setHeading, setTitle, setDescription } = usePageMetadata();
  const [topAccounts, setTopAccounts] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Local state for data
  const [piPrice, setPiPrice] = useState(2.0);
  const [piSupply, setPiSupply] = useState(0);
  const [latestBlock, setLatestBlock] = useState(0);
  const [tps, setTps] = useState(0);

  // Fetch Pi price
  const fetchPiPrice = useCallback(async () => {
    try {
      const marketData = await okx.getMarketData();
      setPiPrice(parseFloat(marketData.idxPx || '2.0'));
    } catch (error) {
      console.error("Error fetching Pi price:", error);
    }
  }, []);

  // Fetch supply data
  const fetchSupply = useCallback(async () => {
    try {
      const supplyData = await socialchain.getSupply();
      setPiSupply(supplyData.total_circulating_supply);
    } catch (error) {
      console.error("Error fetching supply data:", error);
    }
  }, []);

  // Fetch network stats
  const fetchStats = useCallback(async () => {
    try {
      const [blockData, tpsData] = await Promise.all([
        horizon.getLatestBlock(),
        horizon.getTps()
      ]);
      setLatestBlock(blockData);
      setTps(tpsData);
    } catch (error) {
      console.error("Error fetching network stats:", error);
    }
  }, []);

  // Fetch top accounts
  const fetchTopAccounts = useCallback(async (page: number) => {
    try {
      const data = await apiClient.getTopAccounts(page);
      if (data.success) {
        setTopAccounts(data.data);
      }
    } catch (error) {
      console.error("Error fetching top accounts:", error);
    }
  }, []);

  // Fetch distribution data
  const fetchDistributionData = useCallback(async () => {
    try {
      const data = await apiClient.getAddressDistribution();
      if (data.success) {
        setDistributionData(data.data);
      }
    } catch (error) {
      console.error("Error fetching distribution data:", error);
    }
  }, []);

  // Main data fetching function
  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchPiPrice(),
        fetchSupply(),
        fetchStats(),
        fetchTopAccounts(currentPage),
        fetchDistributionData()
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPiPrice, fetchSupply, fetchStats, fetchTopAccounts, fetchDistributionData, currentPage]);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    fetchInitialData();
  }, [fetchData]);

  // Set page metadata
  useEffect(() => {
    setHeading(String(t('account_stats.heading')) || 'Account Statistics');
    setTitle(String(t('account_stats.title')) || 'Account Statistics - Clubhouse Pi');
    setDescription(String(t('account_stats.description')) || 'Pi Network account statistics and data');
  }, [setHeading, setTitle, setDescription, t]);

  const handleRefresh = () => {
    fetchData();
  };

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
          <p className="text-muted-foreground">Loading account statistics...</p>
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
              {t('account_stats.heading')}
            </h1>
            <p className="text-muted-foreground">
              {t('account_stats.description')}
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pi Price</p>
                  <p className="text-2xl font-bold">{formatCurrency(piPrice)}</p>
                </div>
                <Coins className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Circulating Supply</p>
                  <p className="text-2xl font-bold">{formatAmount(piSupply)} π</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Latest Block</p>
                  <p className="text-2xl font-bold">{formatAmount(latestBlock)}</p>
                </div>
                <Activity className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">TPS</p>
                  <p className="text-2xl font-bold">{formatAmount(tps)}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Accounts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Top Accounts by Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topAccounts.map((account, index) => (
                <div key={account.address} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{account.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatAmount(account.balance)} π ({formatCurrency(account.balance * piPrice)})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {((account.balance / piSupply) * 100).toFixed(2)}% of supply
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        {distributionData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Account Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#16a34a', '#22c55e', '#FFBB28', '#FF8042'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AccountStats;
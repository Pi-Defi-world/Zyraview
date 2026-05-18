"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePageMetadata } from '@/context/pagemetadataContext';
import {
  Copy, ExternalLink, Code, Database, Globe, Shield, Zap,
  CheckCircle, AlertCircle, Info, ChevronDown, ChevronRight,
  Terminal, Server, Activity, BarChart3, Wallet, Network,
  Key, Clock, AlertTriangle, FileJson, Layers, List, RefreshCw,
  Wifi
} from 'lucide-react';

type TabId = 'oracle' | 'listings' | 'admin' | 'ecosystem' | 'monitor' | 'social' | 'v2' | 'charts';

interface EndpointDef {
  method: string;
  path: string;
  description: string;
  auth: 'public' | 'api-key' | 'user' | 'admin';
  request?: string;
  response?: string;
}

const SERVICES: Record<TabId, { label: string; icon: React.ElementType; desc: string; endpoints: EndpointDef[] }> = {
  oracle: {
    label: 'Price Oracle',
    icon: BarChart3,
    desc: 'Aggregated Pi price, blockchain data, and Horizon proxy. Requires API key (100 Pi one-time purchase).',
    endpoints: [
      {
        method: 'GET', path: '/api/oracle/v1/price', auth: 'api-key',
        description: 'Aggregated Pi/USD price (weighted average, cached 10s).',
        request: 'curl -H "X-API-Key: zyra_..." "https://Zyrachain-server.onrender.com/api/oracle/v1/price"',
        response: `{ "symbol": "PI", "price_usd": 1.23, "sources_used": 3, "total_sources": 3, "aggregation_method": "weighted_average", "confidence_score": 0.95, "cache_hit": false, "source_prices": { "coingecko": {"price": 1.22, "weight": 1.5}, "okx": {"price": 1.23, "weight": 2.0}, "bitget": {"price": 1.24, "weight": 2.0} } }`
      },
      {
        method: 'GET', path: '/api/oracle/v1/sources', auth: 'api-key',
        description: 'Status and reliability metrics for each upstream price source (CoinGecko, OKX, Bitget).'
      },
      {
        method: 'GET', path: '/api/oracle/v1/health', auth: 'api-key',
        description: 'Oracle process health check (uptime, status).',
        response: `{ "status": "healthy", "uptime": 3600, "timestamp": "2025-05-18T12:00:00.000Z" }`
      },
      {
        method: 'GET', path: '/api/oracle/data/pi-price', auth: 'api-key',
        description: 'Pi price in piscan.io-compatible format.',
        response: `{ "data": [{ "idxPx": "1.2300", "high24h": "1.2300", "open24h": "1.2300", "low24h": "1.2300" }] }`
      },
      {
        method: 'GET', path: '/api/oracle/data/mainnet-supply', auth: 'api-key',
        description: 'Circulating, locked, and total supply snapshot from Pi blockchain.',
        response: `{ "total_circulating_supply": 6600980756.31, "total_locked": 4968482226.45, "total_supply": 10155355009.71 }`
      },
      {
        method: 'ALL', path: '/api/oracle/horizon/*', auth: 'api-key',
        description: 'Transparent proxy to Pi Mainnet Horizon API (accounts, transactions, operations, effects, ledgers, payments, trades, offers).',
        request: 'curl -H "X-API-Key: zyra_..." "https://Zyrachain-server.onrender.com/api/oracle/horizon/accounts/GABC..."'
      },
    ]
  },
  listings: {
    label: 'Listings',
    icon: Layers,
    desc: 'CRUD + search for all listing types. Public read, authenticated write. Paid listings require Pi payment confirmation.',
    endpoints: [
      { method: 'GET', path: '/api/listings/business', auth: 'public', description: 'List approved business listings. Query: ?page=1&limit=20&search=&category=' },
      { method: 'GET', path: '/api/listings/startup', auth: 'public', description: 'List approved startup listings. Same pagination + search.' },
      { method: 'GET', path: '/api/listings/community', auth: 'public', description: 'List approved community listings. Optional ?socialStats=1 merges live Telegram member counts.' },
      { method: 'GET', path: '/api/listings/influencer', auth: 'public', description: 'List approved influencer listings. Optional ?socialStats=1 merges live X follower counts.' },
      { method: 'GET', path: '/api/listings/project', auth: 'public', description: 'List approved project listings.' },
      { method: 'GET', path: '/api/listings/updates', auth: 'public', description: 'List approved listing updates.' },
      { method: 'GET', path: '/api/listings/:type/:id', auth: 'public', description: 'Get single listing by type and ID.' },
      { method: 'POST', path: '/api/listings/:type', auth: 'user', description: 'Create a new listing. Requires Pi auth token in Authorization header.' },
    ]
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    desc: 'OTP-based admin authentication, user management, listing review, analytics, address CRUD. Admin email must be whitelisted.',
    endpoints: [
      { method: 'POST', path: '/api/admin/auth', auth: 'public', description: 'Request OTP: send {email, role}. Verify: send {email, role, otp}. Returns JWT (24h expiry).' },
      { method: 'GET', path: '/api/admin/auth/check', auth: 'admin', description: 'Validate current JWT token.' },
      { method: 'GET', path: '/api/admin/dashboard', auth: 'admin', description: 'Aggregated admin dashboard stats.' },
      { method: 'GET', path: '/api/admin/users', auth: 'admin', description: 'List/manage users.' },
      { method: 'GET', path: '/api/admin/listings', auth: 'admin', description: 'Review pending/approved/rejected listings.' },
      { method: 'PUT', path: '/api/admin/listings/:type/:id/approve', auth: 'admin', description: 'Approve a listing.' },
      { method: 'PUT', path: '/api/admin/listings/:type/:id/reject', auth: 'admin', description: 'Reject a listing.' },
      { method: 'POST', path: '/api/admin/addresses/core-team', auth: 'admin', description: 'Add a Core Team wallet address for PCT monitoring.' },
      { method: 'POST', path: '/api/admin/addresses/cex', auth: 'admin', description: 'Add a CEX wallet address for exchange flow monitoring.' },
      { method: 'GET', path: '/api/admin/analytics', auth: 'admin', description: 'Platform analytics and metrics.' },
    ]
  },
  ecosystem: {
    label: 'Ecosystem',
    icon: Globe,
    desc: 'Ecosystem data hub: communities, events, hackathons, influencers, CEX/core-team addresses.',
    endpoints: [
      { method: 'GET', path: '/api/ecosystem?type=communities', auth: 'public', description: 'List communities.' },
      { method: 'GET', path: '/api/ecosystem?type=events', auth: 'public', description: 'List ecosystem events.' },
      { method: 'GET', path: '/api/ecosystem?type=hackathons', auth: 'public', description: 'List hackathons.' },
      { method: 'GET', path: '/api/ecosystem?type=influencers', auth: 'public', description: 'List influencers.' },
      { method: 'GET', path: '/api/ecosystem?type=cex-addresses', auth: 'public', description: 'Known CEX wallet addresses.' },
      { method: 'GET', path: '/api/ecosystem?type=core-team-addresses', auth: 'public', description: 'Known PCT wallet addresses.' },
      { method: 'GET', path: '/api/ecosystem?type=generated-addresses', auth: 'public', description: 'Generated wallet addresses.' },
      { method: 'GET', path: '/api/events', auth: 'public', description: 'Standalone events CRUD. Query: ?page=1&limit=20' },
      { method: 'GET', path: '/api/hackathons', auth: 'public', description: 'Standalone hackathons CRUD. Query: ?page=1&limit=20' },
      { method: 'POST', path: '/api/core-team-contact', auth: 'public', description: 'Submit a core team contact form.' },
    ]
  },
  monitor: {
    label: 'Wallet Monitors',
    icon: Wallet,
    desc: 'Pi Core Team (PCT) and CEX wallet balance monitoring, movement tracking, and historical data.',
    endpoints: [
      { method: 'GET', path: '/api/pct-monitor/summary', auth: 'public', description: 'PCT wallet aggregate summary (total balance, inflow, outflow, wallet count).' },
      { method: 'GET', path: '/api/pct-monitor/movements', auth: 'public', description: 'Recent PCT wallet movements/transactions. Query: ?page=1&limit=20' },
      { method: 'GET', path: '/api/pct-monitor/changes', auth: 'public', description: 'Balance change events over time.' },
      { method: 'GET', path: '/api/pct-monitor/wallets', auth: 'public', description: 'PCT wallet directory with individual balances.' },
      { method: 'GET', path: '/api/pct-monitor/wallets/:address/history', auth: 'public', description: 'Balance history for a specific PCT wallet.' },
      { method: 'GET', path: '/api/cex-monitor/summary', auth: 'public', description: 'CEX wallet aggregate summary.' },
      { method: 'GET', path: '/api/cex-monitor/movements', auth: 'public', description: 'Recent CEX wallet movements.' },
      { method: 'GET', path: '/api/cex-monitor/changes', auth: 'public', description: 'CEX balance change events.' },
      { method: 'GET', path: '/api/cex-monitor/wallets', auth: 'public', description: 'CEX wallet directory.' },
    ]
  },
  social: {
    label: 'Social Stats',
    icon: Activity,
    desc: 'Live Twitter/X and Telegram public metrics. Requires X_BEARER_TOKEN and TELEGRAM_BOT_TOKEN configured server-side.',
    endpoints: [
      { method: 'GET', path: '/api/social-stats/twitter?handle=@handle', auth: 'public', description: 'X user public metrics (followers, following, tweet count).' },
      { method: 'GET', path: '/api/social-stats/telegram?username=channel', auth: 'public', description: 'Telegram chat member count when available.' },
      { method: 'GET', path: '/api/social-stats/batch?twitter=a,b&telegram=c,d', auth: 'public', description: 'Batch fetch up to 10 Twitter and 10 Telegram handles (shares cache).' },
      { method: 'GET', path: '/api/social-stats/listing/influencer/:id', auth: 'public', description: 'Listing row with live X stats from stored twitter handle.' },
      { method: 'GET', path: '/api/social-stats/listing/community/:id', auth: 'public', description: 'Listing row with live Telegram stats from stored telegram handle.' },
    ]
  },
  v2: {
    label: 'Homepage v2',
    icon: RefreshCw,
    desc: 'Cached snapshot segments powering the homepage. Built by background scheduler at configurable intervals.',
    endpoints: [
      { method: 'GET', path: '/api/v2/home?segment=hero', auth: 'public', description: 'Hero section: Pi price, supply, market cap, 24h stats.' },
      { method: 'GET', path: '/api/v2/home?segment=blocks', auth: 'public', description: 'Latest Pi blockchain blocks.' },
      { method: 'GET', path: '/api/v2/home?segment=transactions', auth: 'public', description: 'Latest transactions.' },
      { method: 'GET', path: '/api/v2/home?segment=ops', auth: 'public', description: 'Latest operations.' },
      { method: 'GET', path: '/api/v2/home?segment=trades', auth: 'public', description: 'Latest DEX trades.' },
      { method: 'GET', path: '/api/v2/home?segment=pulse', auth: 'public', description: 'Network pulse (transaction volume, active accounts).' },
      { method: 'GET', path: '/api/v2/home?segment=top-wallets', auth: 'public', description: 'Top wallets by balance.' },
      { method: 'GET', path: '/api/v2/home?segment=cex-flows', auth: 'public', description: 'CEX inflow/outflow data.' },
      { method: 'GET', path: '/api/v2/home?segment=assets-pools', auth: 'public', description: 'Asset pools and liquidity data.' },
      { method: 'GET', path: '/api/v2/home?segment=ecosystem-leaderboards', auth: 'public', description: 'Ecosystem ranking leaderboards.' },
    ]
  },
  charts: {
    label: 'Charts',
    icon: BarChart3,
    desc: 'Historical price data in OHLCV format for charting.',
    endpoints: [
      { method: 'GET', path: '/api/charts/price-history', auth: 'public', description: 'OHLCV-bucketed price history. Query: ?days=7&bucket=1h. Data from price_history MongoDB collection (5-minute intervals).' },
    ]
  },
};

const AUTH_COLORS: Record<string, string> = {
  'public': 'bg-gray-100 text-gray-700',
  'api-key': 'bg-amber-100 text-amber-700',
  'user': 'bg-blue-100 text-blue-700',
  'admin': 'bg-purple-100 text-purple-700',
};

const METHOD_COLORS: Record<string, string> = {
  'GET': 'bg-green-100 text-green-700',
  'POST': 'bg-blue-100 text-blue-700',
  'PUT': 'bg-amber-100 text-amber-700',
  'DELETE': 'bg-red-100 text-red-700',
  'ALL': 'bg-gray-100 text-gray-700',
};

const ApiDocumentationPage: React.FC = () => {
  const { setHeading, setTitle, setDescription } = usePageMetadata();
  const [activeTab, setActiveTab] = useState<TabId>('oracle');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://Zyrachain-server.onrender.com';

  React.useEffect(() => {
    setHeading('API Documentation');
    setTitle('API Documentation - Zyrachain');
    setDescription('Complete API reference for all Zyrachain services');
  }, [setHeading, setTitle, setDescription]);

  const copyCommand = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const current = SERVICES[activeTab];

  return (
    <div className="min-h-screen bg-background p-3 pb-20 sm:p-4 mobile-nav-safe">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">API Documentation</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Complete reference for all Zyrachain API services. All requests go through{' '}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{apiBase}/api</code>.
          </p>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-card rounded-lg border border-border/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Key className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">API Key</span>
            </div>
            <p className="text-xs text-muted-foreground">100 Pi one-time, no recurring fees</p>
          </div>
          <div className="bg-card rounded-lg border border-border/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">Rate Limit</span>
            </div>
            <p className="text-xs text-muted-foreground">60 req/min, 10,000 req/day per key</p>
          </div>
          <div className="bg-card rounded-lg border border-border/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">Cache</span>
            </div>
            <p className="text-xs text-muted-foreground">10-second TTL on price endpoint</p>
          </div>
          <div className="bg-card rounded-lg border border-border/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <FileJson className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">Format</span>
            </div>
            <p className="text-xs text-muted-foreground">All responses in JSON</p>
          </div>
        </div>

        {/* Service Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-6 border-b border-border/30 pb-3 overflow-x-auto">
          {(Object.keys(SERVICES) as TabId[]).map((key) => {
            const svc = SERVICES[key];
            const Icon = svc.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {svc.label}
              </button>
            );
          })}
        </div>

        {/* Service Description */}
        <div className="bg-muted/30 border border-border/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-foreground text-sm">{current.label}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{current.desc}</p>
            </div>
          </div>
        </div>

        {/* Endpoints Table */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-foreground w-16">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Endpoint</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground hidden sm:table-cell w-24">Auth</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground hidden md:table-cell">Description</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground w-16">Copy</th>
                </tr>
              </thead>
              <tbody>
                {current.endpoints.map((ep, i) => (
                  <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-4">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${METHOD_COLORS[ep.method] || 'bg-gray-100 text-gray-700'}`}>
                        {ep.method}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <code className="text-xs font-mono text-foreground bg-muted/50 px-1.5 py-0.5 rounded break-all">
                        {ep.path}
                      </code>
                    </td>
                    <td className="py-2.5 px-4 hidden sm:table-cell">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${AUTH_COLORS[ep.auth] || ''}`}>
                        {ep.auth}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-muted-foreground hidden md:table-cell">
                      {ep.description}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {ep.request && (
                        <button
                          onClick={() => copyCommand(ep.request!, i)}
                          className="p-1.5 hover:bg-muted rounded transition-colors"
                          title="Copy curl command"
                        >
                          {copiedIndex === i ? (
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Response Examples for current tab */}
        {current.endpoints.some(e => e.response) && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileJson className="h-4 w-4 text-primary" />
              Response Schemas
            </h3>
            {current.endpoints.filter(e => e.response).map((ep, i) => (
              <div key={i} className="bg-muted/40 border border-border/30 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${METHOD_COLORS[ep.method] || ''}`}>{ep.method}</span>
                    <code className="text-xs font-mono text-foreground">{ep.path}</code>
                  </div>
                </div>
                <pre className="text-[11px] text-green-600 overflow-x-auto bg-background/50 rounded p-3">
                  <code>{ep.response}</code>
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* Usage Examples */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Terminal className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Code Examples</h2>
          </div>

          <div className="space-y-6">
            {/* JavaScript fetch */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">JavaScript (fetch)</h4>
              <div className="bg-muted/60 rounded-lg border border-border/30 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 bg-muted border-b border-border/20">
                  <span className="text-xs text-muted-foreground">javascript</span>
                  <button
                    onClick={() => copyCommand(`const BASE = "${apiBase}/api/oracle";
const KEY = "zyra_your_api_key";

const headers = { "X-API-Key": KEY };

// Get Pi price
const price = await fetch(BASE + "/v1/price", { headers }).then(r => r.json());
console.log("Pi: $" + price.price_usd);

// Get supply
const supply = await fetch(BASE + "/data/mainnet-supply", { headers }).then(r => r.json());
console.log("Circulating: " + supply.total_circulating_supply.toLocaleString());

// Horizon proxy: account details
const acct = await fetch(BASE + "/horizon/accounts/GABC...", { headers }).then(r => r.json());
console.log("Balances:", acct.balances);`, -1)}
                    className="p-1 hover:bg-background rounded transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto text-[11px] text-emerald-600">
                  <code>{`const BASE = "${apiBase}/api/oracle";
const KEY = "zyra_your_api_key";

const headers = { "X-API-Key": KEY };

// Get Pi price
const price = await fetch(BASE + "/v1/price", { headers }).then(r => r.json());
console.log("Pi: $" + price.price_usd);

// Get supply
const supply = await fetch(BASE + "/data/mainnet-supply", { headers }).then(r => r.json());
console.log("Circulating: " + supply.total_circulating_supply.toLocaleString());

// Horizon proxy: account details
const acct = await fetch(BASE + "/horizon/accounts/GABC...", { headers }).then(r => r.json());
console.log("Balances:", acct.balances);`}</code>
                </pre>
              </div>
            </div>

            {/* Python */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Python (requests)</h4>
              <div className="bg-muted/60 rounded-lg border border-border/30 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 bg-muted border-b border-border/20">
                  <span className="text-xs text-muted-foreground">python</span>
                  <button
                    onClick={() => copyCommand(`import requests

BASE = "${apiBase}/api/oracle"
HEADERS = {"X-API-Key": "zyra_your_api_key"}

# Current price & confidence
r = requests.get(f"{BASE}/v1/price", headers=HEADERS)
data = r.json()
print(f"Pi: \${data['price_usd']} (confidence: {data['confidence_score']})")

# Supply stats
r = requests.get(f"{BASE}/data/mainnet-supply", headers=HEADERS)
supply = r.json()
print(f"Circulating: {supply['total_circulating_supply']:,}")

# Horizon proxy
r = requests.get(f"{BASE}/horizon/accounts/GABC...", headers=HEADERS)
print(r.json())`, -1)}
                    className="p-1 hover:bg-background rounded transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto text-[11px] text-emerald-600">
                  <code>{`import requests

BASE = "${apiBase}/api/oracle"
HEADERS = {"X-API-Key": "zyra_your_api_key"}

# Current price & confidence
r = requests.get(f"{BASE}/v1/price", headers=HEADERS)
data = r.json()
print(f"Pi: \${data['price_usd']} (confidence: {data['confidence_score']})")

# Supply stats
r = requests.get(f"{BASE}/data/mainnet-supply", headers=HEADERS)
supply = r.json()
print(f"Circulating: {supply['total_circulating_supply']:,}")

# Horizon proxy
r = requests.get(f"{BASE}/horizon/accounts/GABC...", headers=HEADERS)
print(r.json())`}</code>
                </pre>
              </div>
            </div>

            {/* cURL */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">cURL</h4>
              <div className="bg-muted/60 rounded-lg border border-border/30 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 bg-muted border-b border-border/20">
                  <span className="text-xs text-muted-foreground">bash</span>
                  <button
                    onClick={() => copyCommand(`# Price
curl -H "X-API-Key: zyra_..." "${apiBase}/api/oracle/v1/price"

# Sources status
curl -H "X-API-Key: zyra_..." "${apiBase}/api/oracle/v1/sources"

# Supply
curl -H "X-API-Key: zyra_..." "${apiBase}/api/oracle/data/mainnet-supply"

# Horizon proxy
curl -H "X-API-Key: zyra_..." "${apiBase}/api/oracle/horizon/accounts/GABC..."

# Public endpoints (no key needed)
curl "${apiBase}/api/listings/business?page=1&limit=10"
curl "${apiBase}/api/ecosystem?type=communities"
curl "${apiBase}/api/pct-monitor/summary"`, -1)}
                    className="p-1 hover:bg-background rounded transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto text-[11px] text-emerald-600">
                  <code>{`# Price (API key required)
curl -H "X-API-Key: zyra_..." "${apiBase}/api/oracle/v1/price"

# Sources status
curl -H "X-API-Key: zyra_..." "${apiBase}/api/oracle/v1/sources"

# Supply
curl -H "X-API-Key: zyra_..." "${apiBase}/api/oracle/data/mainnet-supply"

# Horizon proxy
curl -H "X-API-Key: zyra_..." "${apiBase}/api/oracle/horizon/accounts/GABC..."

# Public endpoints (no key needed)
curl "${apiBase}/api/listings/business?page=1&limit=10"
curl "${apiBase}/api/ecosystem?type=communities"
curl "${apiBase}/api/pct-monitor/summary"`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Guide */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Authentication</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium text-foreground text-sm mb-2">Oracle API Key</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Purchase for 100 Pi. Send in <code className="bg-background px-1 rounded">X-API-Key</code> header or <code className="bg-background px-1 rounded">?apiKey=</code> query parameter.
                Keys are SHA-256 hashed with a pepper — server never stores plaintext.
              </p>
              <p className="text-xs text-muted-foreground">
                <Link href="/oracle-api" className="text-primary hover:underline">Purchase a key</Link>
                {' | '}
                <Link href="/api-dashboard" className="text-primary hover:underline">Manage your keys</Link>
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium text-foreground text-sm mb-2">User Auth (Pi Network)</h4>
              <p className="text-xs text-muted-foreground">
                Users authenticate via Pi Browser SDK. Server verifies the Pi access token against the Pi Platform API.
                Send in <code className="bg-background px-1 rounded">Authorization: Bearer &lt;pi_access_token&gt;</code>.
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium text-foreground text-sm mb-2">Admin Auth (OTP + JWT)</h4>
              <p className="text-xs text-muted-foreground">
                Admins receive a 6-digit OTP via email (SMTP). After verification, receive a JWT (24h expiry) used as{' '}
                <code className="bg-background px-1 rounded">Authorization: Bearer &lt;jwt&gt;</code>.
                Email must be whitelisted in server config.
              </p>
            </div>
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-foreground">Rate Limiting</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-2 font-medium text-foreground">Scope</th>
                  <th className="text-left py-2 font-medium text-foreground">Limit</th>
                  <th className="text-left py-2 font-medium text-foreground">Header / Info</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground text-xs">
                <tr className="border-b border-border/20">
                  <td className="py-2">Oracle API Key (per minute)</td>
                  <td className="py-2">60 requests</td>
                  <td className="py-2">429 if exceeded</td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2">Oracle API Key (per day)</td>
                  <td className="py-2">10,000 requests</td>
                  <td className="py-2">Rolling 24h window</td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2">Global (all routes)</td>
                  <td className="py-2">800 req/15 min (production) | 20,000 req/15 min (dev)</td>
                  <td className="py-2">Via express-rate-limit</td>
                </tr>
                <tr>
                  <td className="py-2">Horizon Proxy</td>
                  <td className="py-2">10-second timeout</td>
                  <td className="py-2">Forwarded to Pi Mainnet Horizon</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Pricing</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-2 font-medium text-foreground">Access Level</th>
                  <th className="text-left py-2 font-medium text-foreground">Cost</th>
                  <th className="text-left py-2 font-medium text-foreground">Endpoints</th>
                </tr>
              </thead>
              <tbody className="text-xs text-muted-foreground">
                <tr className="border-b border-border/20">
                  <td className="py-2 font-medium text-foreground">Oracle API Key</td>
                  <td className="py-2">100 Pi (one-time)</td>
                  <td className="py-2">/api/oracle/* — price, sources, health, pi-data, horizon proxy</td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2 font-medium text-foreground">Business Listing</td>
                  <td className="py-2">20 Pi</td>
                  <td className="py-2">Submit a business listing</td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2 font-medium text-foreground">Startup / Community / Influencer Listing</td>
                  <td className="py-2">50 Pi each</td>
                  <td className="py-2">Submit respective listing type</td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2 font-medium text-foreground">Company Listing</td>
                  <td className="py-2">100 Pi</td>
                  <td className="py-2">Submit a company listing</td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2 font-medium text-foreground">Listing Update</td>
                  <td className="py-2">80 Pi</td>
                  <td className="py-2">Update an existing listing</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-foreground">All Public Endpoints</td>
                  <td className="py-2 text-green-600 font-medium">Free</td>
                  <td className="py-2">Listings read, ecosystem, PCT/CEX monitors, v2 home, charts, social stats</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground py-4">
          <div className="flex items-center gap-3">
            <Link href="/oracle-api" className="hover:text-foreground transition-colors">Get API Key</Link>
            <Link href="/api-dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          </div>
          <span>v1.0</span>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentationPage;

"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePageMetadata } from '@/context/pagemetadataContext';
import { 
  Copy, 
  ExternalLink, 
  Code, 
  Database, 
  Globe, 
  Shield, 
  Zap, 
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Terminal,
  Server,
  Activity,
  BarChart3,
  Wallet,
  Network
} from 'lucide-react';

const ApiDocumentationPage: React.FC = () => {
  const { setHeading, setTitle, setDescription } = usePageMetadata();
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    overview: true,
    zyraviewOracle: true,
    priceEndpoints: true,
    piDataEndpoints: false,
    horizonEndpoints: false,
    examples: false,
    migration: false
  });

  const zyraviewOracleBase =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
    'https://zyraview-server.onrender.com';

  const pythonExampleCode = `import requests

BASE = "${zyraviewOracleBase}/api/oracle"
API_KEY = "zyra_your_key_here"
headers = {"X-API-Key": API_KEY}

# Get current aggregated price (requires API key from Zyraview)
response = requests.get(f"{BASE}/v1/price", headers=headers)
price_data = response.json()
print('Pi price: $' + str(price_data['price_usd']))

# Supply data
supply_response = requests.get(f"{BASE}/data/mainnet-supply", headers=headers)
supply_data = supply_response.json()
print('Total supply: ' + str(supply_data['total_supply']))`;

  React.useEffect(() => {
    setHeading('API Documentation');
    setTitle('API Documentation - Pi Network Oracle');
    setDescription('Complete API documentation for the Pi Network Price Oracle and data endpoints');
  }, [setHeading, setTitle, setDescription]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const SectionHeader = ({ 
    title, 
    icon: Icon, 
    sectionKey, 
    children 
  }: { 
    title: string; 
    icon: any; 
    sectionKey: string; 
    children: React.ReactNode; 
  }) => (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="border-t border-border/30 p-4 sm:p-6">
          {children}
        </div>
      )}
    </div>
  );

  const CodeBlock = ({ 
    code, 
    language = "bash", 
    title 
  }: { 
    code: string; 
    language?: string; 
    title?: string; 
  }) => (
    <div className="bg-muted/50 rounded-lg border border-border/30 overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border/30">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <button
            onClick={() => copyToClipboard(code)}
            className="p-1 hover:bg-background rounded transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className={`text-sm ${language === 'json' ? 'text-green-600' : 'text-emerald-600'}`}>
          {code}
        </code>
      </pre>
    </div>
  );

  const EndpointCard = ({ 
    method, 
    endpoint, 
    description, 
    example, 
    response 
  }: {
    method: string;
    endpoint: string;
    description: string;
    example?: string;
    response?: string;
  }) => (
    <div className="bg-muted/30 rounded-lg border border-border/30 p-4 space-y-3">
      <div className="flex items-center space-x-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-emerald-100 text-emerald-800'
        }`}>
          {method}
        </span>
        <code className="text-sm font-mono text-foreground bg-background px-2 py-1 rounded">
          {endpoint}
        </code>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {example && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Example Request:</h4>
          <CodeBlock code={example} />
        </div>
      )}
      {response && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Response:</h4>
          <CodeBlock code={response} language="json" />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-3 pb-20 sm:p-4 mobile-nav-safe">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">API Documentation</h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Complete documentation for the Pi Network Price Oracle and data endpoints. 
            Access real-time Pi prices, blockchain data, and more.
          </p>
        </div>

        {/* Zyraview Oracle (paid API key) */}
        <SectionHeader title="Zyraview Oracle API (recommended)" icon={Shield} sectionKey="zyraviewOracle">
          <p className="text-sm text-muted-foreground mb-4">
            The oracle is hosted on Zyraview. Purchase a key for <strong>100 Pi</strong> on the{' '}
            <Link href="/oracle-api" className="text-primary font-medium hover:underline">
              Oracle API
            </Link>{' '}
            page, then send <code className="text-xs bg-muted px-1 rounded">X-API-Key</code> on every
            request.
          </p>
          <div className="flex items-center space-x-2 mb-4">
            <code className="text-sm font-mono bg-background px-3 py-2 rounded border flex-1 break-all">
              {zyraviewOracleBase}/api/oracle
            </code>
            <button
              onClick={() => copyToClipboard(`${zyraviewOracleBase}/api/oracle`)}
              className="p-2 hover:bg-background rounded transition-colors shrink-0"
              title="Copy base URL"
            >
              <Copy className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-3">
            <EndpointCard
              method="GET"
              endpoint="/v1/price"
              description="Aggregated PI/USD price (weighted average, cached)."
              example={`curl -H "X-API-Key: zyra_..." "${zyraviewOracleBase}/api/oracle/v1/price"`}
            />
            <EndpointCard
              method="GET"
              endpoint="/v1/sources"
              description="Status of each upstream price source."
            />
            <EndpointCard
              method="GET"
              endpoint="/v1/health"
              description="Oracle process health and uptime."
            />
            <EndpointCard
              method="GET"
              endpoint="/data/pi-price"
              description="Pi price in piscan-style shape."
            />
            <EndpointCard
              method="GET"
              endpoint="/data/mainnet-supply"
              description="Circulating / locked / total supply snapshot."
            />
            <EndpointCard
              method="ALL"
              endpoint="/horizon/*"
              description="Proxy to Pi mainnet Horizon (path forwarded)."
            />
          </div>
        </SectionHeader>

        {/* Legacy / public oracle URL (reference only) */}
        <div className="bg-muted/30 border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Server className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Legacy public oracle (reference)</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Older deployments may still use this base URL without Zyraview API keys.
          </p>
          <div className="flex items-center space-x-2">
            <code className="text-sm font-mono bg-background px-3 py-2 rounded border flex-1">
              https://oracle-three-xi.vercel.app
            </code>
            <button
              onClick={() => copyToClipboard('https://oracle-three-xi.vercel.app')}
              className="p-2 hover:bg-background rounded transition-colors"
              title="Copy base URL"
            >
              <Copy className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Features Overview */}
        <SectionHeader title="Features Overview" icon={Zap} sectionKey="overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Multiple Data Sources</h4>
                <p className="text-sm text-muted-foreground">CoinGecko, Bitget, OKX exchanges</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Cost Effective</h4>
                <p className="text-sm text-muted-foreground">Free API tiers with intelligent caching</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Real-time Updates</h4>
                <p className="text-sm text-muted-foreground">30-second cache with efficient polling</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Fault Tolerant</h4>
                <p className="text-sm text-muted-foreground">Continues operating if sources fail</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Pi Network Integration</h4>
                <p className="text-sm text-muted-foreground">Complete piscan.io API compatibility</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Horizon Proxy</h4>
                <p className="text-sm text-muted-foreground">Direct Pi Network blockchain access</p>
              </div>
            </div>
          </div>
        </SectionHeader>

        {/* Price Oracle Endpoints */}
        <SectionHeader title="Price Oracle Endpoints" icon={BarChart3} sectionKey="priceEndpoints">
          <div className="space-y-4">
            <EndpointCard
              method="GET"
              endpoint="/api/v1/price"
              description="Get the current aggregated Pi Network price from multiple sources"
              example="curl https://oracle-three-xi.vercel.app/api/v1/price"
              response={`{
  "symbol": "PI",
  "price_usd": 1.23,
  "timestamp": "2025-01-14T12:00:00.000Z",
  "sources_used": 3,
  "total_sources": 3,
  "aggregation_method": "weighted_average",
  "source_prices": {
    "coingecko": { "price": 1.22, "weight": 1.5, "timestamp": "2025-01-14T12:00:00.000Z" },
    "bitget": { "price": 1.23, "weight": 2.0, "timestamp": "2025-01-14T12:00:00.000Z" },
    "okx": { "price": 1.24, "weight": 1.5, "timestamp": "2025-01-14T12:00:00.000Z" }
  },
  "confidence_score": 0.95,
  "cache_hit": false
}`}
            />

            <EndpointCard
              method="GET"
              endpoint="/api/v1/health"
              description="Check the health status of the oracle service"
              example="curl https://oracle-three-xi.vercel.app/api/v1/health"
              response={`{
  "status": "healthy",
  "uptime": 3600,
  "timestamp": "2025-01-14T12:00:00.000Z"
}`}
            />

            <EndpointCard
              method="GET"
              endpoint="/api/v1/sources"
              description="Get the status and reliability metrics of all data sources"
              example="curl https://oracle-three-xi.vercel.app/api/v1/sources"
              response={`{
  "sources": [
    {
      "name": "coingecko",
      "status": "active",
      "last_success": "2025-01-14T12:00:00.000Z",
      "last_error": null,
      "success_rate": 0.99,
      "avg_response_time_ms": 250
    }
  ]
}`}
            />
          </div>
        </SectionHeader>

        {/* Pi Network Data Endpoints */}
        <SectionHeader title="Pi Network Data Endpoints" icon={Database} sectionKey="piDataEndpoints">
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-emerald-900">Compatible</h4>
                  <p className="text-sm text-emerald-700">
                    These endpoints maintain full compatibility with the Pi Network API format for easy integration.
                  </p>
                </div>
              </div>
            </div>

            <EndpointCard
              method="GET"
              endpoint="/data/pi-price"
              description="Get Pi price in Pi Network format"
              example="curl https://oracle-three-xi.vercel.app/data/pi-price"
              response={`{
  "data": [{
    "idxPx": "1.2300",
    "high24h": "1.2300",
    "open24h": "1.2300",
    "low24h": "1.2300"
  }]
}`}
            />

            <EndpointCard
              method="GET"
              endpoint="/data/mainnet-supply"
              description="Get Pi Network mainnet supply statistics"
              example="curl https://oracle-three-xi.vercel.app/data/mainnet-supply"
              response={`{
  "total_circulating_supply": 6600980756.30989,
  "total_locked": 4968482226.44967,
  "total_supply": 10155355009.7075
}`}
            />

            <EndpointCard
              method="GET"
              endpoint="/check-scam-wallet/:address"
              description="Check if a wallet address is flagged as a scam"
              example="curl https://oracle-three-xi.vercel.app/check-scam-wallet/GABC123..."
              response={`{
  "address": "GABC123...",
  "is_scam": false,
  "reason": null
}`}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EndpointCard
                method="GET"
                endpoint="/top-accounts"
                description="Get top Pi Network accounts"
              />
              <EndpointCard
                method="GET"
                endpoint="/accounts/distribution"
                description="Get account distribution data"
              />
              <EndpointCard
                method="GET"
                endpoint="/data/unlocknext30d"
                description="Get unlock data for next 30 days"
              />
              <EndpointCard
                method="GET"
                endpoint="/data/unlockfull"
                description="Get complete unlock statistics"
              />
              <EndpointCard
                method="GET"
                endpoint="/data/nodemap"
                description="Get Pi Network node map data"
              />
              <EndpointCard
                method="GET"
                endpoint="/transactions"
                description="Get recent Pi Network transactions"
              />
            </div>
          </div>
        </SectionHeader>

        {/* Horizon Proxy Endpoints */}
        <SectionHeader title="Horizon Proxy Endpoints" icon={Network} sectionKey="horizonEndpoints">
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Globe className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Direct Pi Network Access</h4>
                  <p className="text-sm text-green-700">
                    All requests to <code>/horizon/*</code> are proxied to the official Pi Network Horizon API.
                  </p>
                </div>
              </div>
            </div>

            <EndpointCard
              method="GET"
              endpoint="/horizon/*"
              description="Proxy to Pi Network Horizon API - all endpoints supported"
              example="curl https://oracle-three-xi.vercel.app/horizon/accounts/GABC123..."
            />

            <div className="bg-muted/30 rounded-lg border border-border/30 p-4">
              <h4 className="font-medium text-foreground mb-2">Supported Horizon Endpoints:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <code>/horizon/accounts/:accountId</code> - Get account details</li>
                <li>• <code>/horizon/transactions</code> - Get transaction history</li>
                <li>• <code>/horizon/operations</code> - Get operation details</li>
                <li>• <code>/horizon/effects</code> - Get effect details</li>
                <li>• <code>/horizon/ledgers</code> - Get ledger information</li>
                <li>• <code>/horizon/payments</code> - Get payment transactions</li>
              </ul>
            </div>
          </div>
        </SectionHeader>

        {/* Usage Examples */}
        <SectionHeader title="Usage Examples" icon={Terminal} sectionKey="examples">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">JavaScript/TypeScript</h4>
              <CodeBlock 
                code={`// Fetch current Pi price
const response = await fetch('https://oracle-three-xi.vercel.app/api/v1/price');
const priceData = await response.json();
console.log(\`Pi price: $\${priceData.price_usd}\`);

// Fetch Pi supply data
const supplyResponse = await fetch('https://oracle-three-xi.vercel.app/data/mainnet-supply');
const supplyData = await supplyResponse.json();
console.log(\`Total supply: \${supplyData.total_supply}\`);

// Check scam wallet
const scamCheck = await fetch('https://oracle-three-xi.vercel.app/check-scam-wallet/GABC123...');
const scamData = await scamCheck.json();
console.log(\`Is scam: \${scamData.is_scam}\`);`}
                language="javascript"
                title="JavaScript Example"
              />
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">Python</h4>
              <CodeBlock 
                code={pythonExampleCode}
                language="python"
                title="Python Example"
              />
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">cURL Commands</h4>
              <CodeBlock 
                code={`# Get current price
curl https://oracle-three-xi.vercel.app/api/v1/price

# Get supply data
curl https://oracle-three-xi.vercel.app/data/mainnet-supply

# Check scam wallet
curl https://oracle-three-xi.vercel.app/check-scam-wallet/GABC123...

# Get account details via Horizon
curl https://oracle-three-xi.vercel.app/horizon/accounts/GABC123...`}
                language="bash"
                title="cURL Examples"
              />
            </div>
          </div>
        </SectionHeader>


        {/* Cost Analysis */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Cost Analysis</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-2 font-medium text-foreground">Source</th>
                  <th className="text-left py-2 font-medium text-foreground">Free Tier Limit</th>
                  <th className="text-left py-2 font-medium text-foreground">Cost After Free</th>
                  <th className="text-left py-2 font-medium text-foreground">Auth Required</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/20">
                  <td className="py-2">CoinGecko</td>
                  <td className="py-2">50 calls/min</td>
                  <td className="py-2">$0</td>
                  <td className="py-2">No</td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2">Bitget</td>
                  <td className="py-2">Rate limited</td>
                  <td className="py-2">$0</td>
                  <td className="py-2">No</td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2">OKX</td>
                  <td className="py-2">Rate limited</td>
                  <td className="py-2">$0</td>
                  <td className="py-2">No</td>
                </tr>
                <tr>
                  <td className="py-2">Horizon API</td>
                  <td className="py-2">Rate limited</td>
                  <td className="py-2">$0</td>
                  <td className="py-2">No</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary">
              <strong>Total Monthly Cost with 30-second caching: $0</strong>
            </p>
            <p className="text-xs text-primary/80 mt-1">
              With caching, you get ~86,400 requests/month within all free tiers
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com/Junman140/oracle" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View on GitHub</span>
            </a>
            <a 
              href="https://oracle-three-xi.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Live API</span>
            </a>
          </div>
          <div className="text-xs text-muted-foreground">
            Last updated: October 2025
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentationPage;

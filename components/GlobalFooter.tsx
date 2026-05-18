import React from 'react';
import Link from 'next/link';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Settings,
  ArrowRightLeft,
  BarChart3,
  Server,
  Building,
  Star,
  RefreshCw,
  FileText,
  Shield,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';

const GlobalFooter: React.FC = () => {
  return (
    <footer className="block border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info - Takes 2 columns on large screens */}
            <div className="space-y-6 lg:col-span-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground font-heading">Zyrachain</h3>
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                  Your comprehensive Pi Network ecosystem and community hub. Explore transactions, blocks, and engage with the Pi ecosystem.
                </p>
              </div>
              
              {/* Social Links */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Follow Us</h4>
                <div className="flex space-x-4">
                  <Link 
                    href="#" 
                    className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-popover rounded-md"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </Link>
                  <Link 
                    href="#" 
                    className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-popover rounded-md"
                    aria-label="GitHub"
                  >
                    <Github className="h-5 w-5" />
                  </Link>
                  <Link 
                    href="#" 
                    className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-popover rounded-md"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Explorer & Tools */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Explorer & Tools</h3>
              <nav className="space-y-3">
                <Link href="/Transaction-list" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                  <ArrowRightLeft className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Transactions</span>
                </Link>
                <Link href="/block" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                  <Server className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Blocks</span>
                </Link>
                <Link href="/operations" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                  <BarChart3 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Operations</span>
                </Link>
                {/* <Link href="/nodes" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                  <Server className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Nodes</span>
                </Link> */}
                 
              </nav>
            </div>

            {/* Ecosystem & Listings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Ecosystem & Listings</h3>
              <nav className="space-y-3">
                <Link href="/get-listed" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                  <Star className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Project Listing</span>
                </Link>
                <Link href="/business-listing" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                  <Building className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Business Listing</span>
                </Link>
                <Link href="/startup-listing" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                  <Star className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Startup Listing</span>
                </Link>
                <Link href="/update-listing" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                  <RefreshCw className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Update Listing</span>
                </Link>
              </nav>
            </div>

            {/* Settings & Support */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Support</h3>
              <nav className="space-y-3">
                {/* <Link href="/settings" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                  <Settings className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Settings</span>
                </Link> */}
                <Link href="/contactUs" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                  <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Contact</span>
                </Link>
                <Link href="/Report-scam" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                  <AlertTriangle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Report Scam</span>
                </Link>
                 
              </nav>
            </div>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
                            &copy; {new Date().getFullYear()} Zyrachain. All rights reserved.
            </div>
            
            {/* Legal Links */}
            <div className="flex items-center space-x-6">
              <Link 
                href="/Termsofservice" 
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <FileText className="h-3 w-3 group-hover:scale-110 transition-transform" />
                <span>Terms of Service</span>
              </Link>
              <Link 
                href="/Privacy-Policy" 
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Shield className="h-3 w-3 group-hover:scale-110 transition-transform" />
                <span>Privacy Policy</span>
              </Link>
              <Link 
                href="/Report-scam" 
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <AlertTriangle className="h-3 w-3 group-hover:scale-110 transition-transform" />
                <span>Report Scam</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
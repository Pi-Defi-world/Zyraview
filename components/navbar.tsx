"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiX } from "react-icons/fi";
import { BookOpen, Users, Plug, Menu, CheckCircle, LayoutGrid, Wallet, Layers, ArrowLeftRight, Activity, Coins, Droplets, TrendingUp, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/languagecontext";
import { usePiNetwork } from "@/context/PiNetworkContext";
import Logo from './logo';
import { ModeToggle } from '@/components/ui/mode-toggle';

const explorerLinks = [
  { href: '/block', label: 'Blocks', icon: Layers },
  { href: '/Transaction-list', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/operations', label: 'Operations', icon: Activity },
  { href: '/assets', label: 'Assets', icon: Coins },
  { href: '/pool', label: 'Liquidity Pools', icon: Droplets },
  { href: '/trades-history', label: 'Trades', icon: TrendingUp },
];

const Navbar: React.FC = () => {
  const { t } = useLanguage();
  const { isAuthenticated, authenticate } = usePiNetwork();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showExplorerDropdown, setShowExplorerDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowExplorerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors group">
              <Logo size="sm" showText={false} />
              <span className="font-heading font-bold text-lg">Zyraview</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-5">
              <div className="flex items-center space-x-5">
                <Link href="/" className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors">Home</Link>
                
                {/* Explorer Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowExplorerDropdown(!showExplorerDropdown)}
                    className="flex items-center gap-1 text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
                  >
                    Explorer
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showExplorerDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showExplorerDropdown && (
                    <div className="absolute top-full left-0 mt-1.5 w-44 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                      {explorerLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-muted/50 transition-colors"
                          onClick={() => setShowExplorerDropdown(false)}
                        >
                          <link.icon className="h-4 w-4 text-muted-foreground" />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link href="/startup" className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors">Alpha</Link>
                <Link href="/pct-wallet-monitor" className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors">{t('pct.nav')}</Link>
                <Link href="/cex-wallet-monitor" className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors">{t('cex_monitor.nav')}</Link>
                <Link href="/ecology" className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors">Community</Link>
                <Link href="/directory" className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors">Directory</Link>
                <Link href="/api-documentation" className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors">API Docs</Link>
                <Link href="/oracle-api" className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors">Oracle API</Link>
                <Link href="/profile" className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors">Profile</Link>
              </div>
              <ModeToggle />
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <ModeToggle />
              <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-md text-foreground hover:text-primary hover:bg-card transition-colors md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div 
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          />
          
          <div className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-card border-l border-border shadow-lg">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <Logo size="sm" showText={false} />
                  <span className="font-heading font-bold text-lg text-foreground">Zyraview</span>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 rounded-md text-foreground hover:text-primary hover:bg-popover transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="space-y-1">
                  <Link href="/" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:text-primary hover:bg-popover transition-colors" onClick={() => setShowMobileMenu(false)}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home"><path d="M3 9.5L12 4l9 5.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    <span>Home</span>
                  </Link>
                  <Link href="/startup" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:text-primary hover:bg-popover transition-colors" onClick={() => setShowMobileMenu(false)}>
                    <BookOpen className="h-4 w-4" />
                    <span>Startup</span>
                  </Link>
                  <Link href="/pct-wallet-monitor" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:text-primary hover:bg-popover transition-colors" onClick={() => setShowMobileMenu(false)}>
                    <Wallet className="h-4 w-4" />
                    <span>{t('pct.nav')}</span>
                  </Link>
                  <Link href="/cex-wallet-monitor" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:text-primary hover:bg-popover transition-colors" onClick={() => setShowMobileMenu(false)}>
                    <Wallet className="h-4 w-4" />
                    <span>{t('cex_monitor.nav')}</span>
                  </Link>
                  <Link href="/ecology" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:text-primary hover:bg-popover transition-colors" onClick={() => setShowMobileMenu(false)}>
                    <Users className="h-4 w-4" />
                    <span>Community</span>
                  </Link>
                  <Link href="/directory" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:text-primary hover:bg-popover transition-colors" onClick={() => setShowMobileMenu(false)}>
                    <LayoutGrid className="h-4 w-4" />
                    <span>Directory</span>
                  </Link>
                  <Link href="/api-documentation" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:text-primary hover:bg-popover transition-colors" onClick={() => setShowMobileMenu(false)}>
                    <BookOpen className="h-4 w-4" />
                    <span>API Docs</span>
                  </Link>
                  <Link href="/oracle-api" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:text-primary hover:bg-popover transition-colors" onClick={() => setShowMobileMenu(false)}>
                    <BookOpen className="h-4 w-4" />
                    <span>Oracle API</span>
                  </Link>
                  <Link href="/profile" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:text-primary hover:bg-popover transition-colors" onClick={() => setShowMobileMenu(false)}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>Profile</span>
                  </Link>
                </div>

                {/* Pi Authentication */}
                <div className="pt-4 border-t border-border">
                  <button
                    onClick={async () => {
                      if (typeof window !== 'undefined' && window.Pi) {
                        try { await authenticate(); } catch {}
                      }
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                  >
                    <span className="flex items-center">
                      <Plug className="w-4 h-4 mr-2" />
                      {isAuthenticated ? 'Connected' : 'Connect Pi Wallet'}
                    </span>
                    {isAuthenticated && <CheckCircle className="w-4 h-4" />}
                  </button>
                </div>

                {/* Social Media */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-neutral-400 mb-2 px-3">Follow Us</h3>
                  <div className="flex justify-center space-x-4 px-3">
                    <a href="https://twitter.com/zyraview" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary transition-colors" aria-label="Twitter">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    </a>
                    <a href="https://t.me/zyraview" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary transition-colors" aria-label="Telegram">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    </a>
                    <a href="https://discord.gg/zyraview" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary transition-colors" aria-label="Discord">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/></svg>
                    </a>
                    <a href="https://github.com/zyraview" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary transition-colors" aria-label="GitHub">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Mobile Bottom Navigation Component
const MobileBottomNav: React.FC = () => {
  const { t } = useLanguage();
  const { isAuthenticated, authenticate, logout } = usePiNetwork();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handlePiConnect = async () => {
    try {
      if (isAuthenticated) {
        logout();
      } else {
        await authenticate();
      }
    } catch (error) {
      console.error('Pi authentication failed:', error);
    }
  };

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 100 || currentScrollY > document.body.scrollHeight - window.innerHeight - 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 1rem)',
          paddingLeft: 'env(safe-area-inset-left, 1rem)',
          paddingRight: 'env(safe-area-inset-right, 1rem)'
        }}
      >
        <div className="relative max-w-sm mx-auto">
          <div className="bg-card/80 backdrop-blur-md border border-border rounded-xl shadow-lg px-3 py-1.5">
            <div className="flex justify-around items-center">
              <Link href="/" className={`flex flex-col items-center justify-center transition-colors p-1.5 ${pathname === '/' ? 'text-primary' : 'text-neutral-400 hover:text-primary'}`}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home"><path d="M3 9.5L12 4l9 5.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span className="text-[10px] mt-0.5">Home</span>
              </Link>
              <Link href="/startup" className={`flex flex-col items-center justify-center transition-colors p-1.5 ${pathname.startsWith('/startup') ? 'text-primary' : 'text-neutral-400 hover:text-primary'}`}>
                <BookOpen className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">Startup</span>
              </Link>
              <Link href="/ecology" className={`flex flex-col items-center justify-center transition-colors p-1.5 ${pathname.startsWith('/ecology') ? 'text-primary' : 'text-neutral-400 hover:text-primary'}`}>
                <Users className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">Community</span>
              </Link>
              <Link href="/profile" className={`flex flex-col items-center justify-center transition-colors p-1.5 ${pathname.startsWith('/profile') ? 'text-primary' : 'text-neutral-400 hover:text-primary'}`}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span className="text-[10px] mt-0.5">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Combined component with both desktop and mobile navigation
const NavbarWithMobile: React.FC = () => {
  return (
    <>
      <Navbar />
      <MobileBottomNav />
    </>
  );
};

export default NavbarWithMobile; 

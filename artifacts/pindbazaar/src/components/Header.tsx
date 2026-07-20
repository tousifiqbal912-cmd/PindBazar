import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSiteSettings } from '@/hooks/use-queries';
import { AnimatePresence, motion } from 'framer-motion';

export const Header = () => {
  const [location, setLocation] = useLocation();
  const { cart, setIsCartOpen } = useCart();
  const { data: settings } = useSiteSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Featured', href: '/#featured' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground text-xs text-center py-2 px-4 font-medium tracking-wide">
        Cash on Delivery available nationwide! 100% pure authentic village goods.
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 -ml-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 z-10 shrink-0">
            <img
              src="/logo.png"
              alt="PindBazaar"
              className="w-11 h-11 object-contain"
            />
            <span className="font-serif font-bold text-2xl hidden sm:block tracking-tight text-primary">
              Pind<span className="text-accent">Bazaar</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors hover:text-accent ${
                  location === link.href ? 'text-primary border-b-2 border-accent pb-1' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-foreground" />
            </button>

            {/* Cart Toggle */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 hover:bg-muted rounded-full transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 text-foreground" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background transform translate-x-1/4 -translate-y-1/4">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Overlay Dropdown */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute top-full left-0 right-0 bg-card border-b shadow-lg overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4">
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search for Desi Ghee, Honey, Dates..."
                    className="w-full pl-12 pr-4 py-3 bg-muted rounded-full border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-card z-50 md:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="PindBazaar" className="w-9 h-9 object-contain" />
                  <span className="font-serif font-bold text-2xl text-primary">
                    Pind<span className="text-accent">Bazaar</span>
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-muted rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <form onSubmit={handleSearch} className="mb-8 relative">
                  <input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-4 pr-10 py-3 bg-muted rounded-xl outline-none focus:ring-2 ring-primary/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </button>
                </form>
                <nav className="space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                        location === link.href ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

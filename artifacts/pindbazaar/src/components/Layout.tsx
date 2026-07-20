import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { useSiteSettings } from '@/hooks/use-queries';
import { MessageCircle } from 'lucide-react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { data: settings } = useSiteSettings();

  // Admin routes don't use the main shop layout
  if (location.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      
      <Footer />
      
      <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} setIsOpen={setIsCheckoutOpen} />

      {/* WhatsApp FAB */}
      {settings?.whatsapp_number && (
        <a
          href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      )}
    </div>
  );
};

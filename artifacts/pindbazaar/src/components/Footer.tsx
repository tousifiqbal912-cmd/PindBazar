import React from 'react';
import { Link } from 'wouter';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-queries';

export const Footer = () => {
  const { data: settings } = useSiteSettings();

  return (
    <footer className="bg-[#0A3821] text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="font-serif font-bold text-3xl text-white">
                Pind<span className="text-accent">Bazaar</span>
              </span>
            </Link>
            <p className="text-primary-foreground/80 leading-relaxed">
              Bringing the pure, unadulterated goodness of village farms directly to your doorstep in the city. Authentic tastes, honest pricing.
            </p>
            <div className="flex gap-4">
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-primary-foreground/80 hover:text-accent transition-colors">Home</Link></li>
              <li><Link href="/products" className="text-primary-foreground/80 hover:text-accent transition-colors">Shop All Products</Link></li>
              <li><Link href="/about" className="text-primary-foreground/80 hover:text-accent transition-colors">Our Story</Link></li>
              <li><Link href="/contact" className="text-primary-foreground/80 hover:text-accent transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-6 text-white">Customer Service</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-primary-foreground/80 hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="/privacy" className="text-primary-foreground/80 hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-primary-foreground/80 hover:text-accent transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/privacy" className="text-primary-foreground/80 hover:text-accent transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-6 text-white">Get in Touch</h4>
            <ul className="space-y-4">
              {settings?.whatsapp_number && (
                <li className="flex items-start gap-3 text-primary-foreground/80">
                  <Phone className="w-5 h-5 shrink-0 mt-0.5 text-accent" />
                  <span>{settings.whatsapp_number}</span>
                </li>
              )}
              {settings?.contact_email && (
                <li className="flex items-start gap-3 text-primary-foreground/80">
                  <Mail className="w-5 h-5 shrink-0 mt-0.5 text-accent" />
                  <span>{settings.contact_email}</span>
                </li>
              )}
              <li className="flex items-start gap-3 text-primary-foreground/80">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-accent" />
                <span>Lahore, Pakistan<br/>Deliveries Nationwide</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} PindBazaar. All rights reserved.
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/10 rounded text-xs font-medium text-white/80">Cash on Delivery</span>
            <span className="px-3 py-1 bg-white/10 rounded text-xs font-medium text-white/80">100% Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

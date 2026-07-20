import React from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Package, Image as ImageIcon, ShoppingCart, Settings, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

import ProductsTab from './tabs/ProductsTab';
import CategoriesTab from './tabs/CategoriesTab';
import BannersTab from './tabs/BannersTab';
import OrdersTab from './tabs/OrdersTab';
import SettingsTab from './tabs/SettingsTab';
import { Link } from 'wouter';

export default function Dashboard() {
  const { logout } = useAdmin();

  return (
    <div className="min-h-[100dvh] bg-muted/10">
      {/* Admin Header */}
      <header className="bg-card border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="font-serif font-bold text-xl text-primary">
              Pind<span className="text-accent">Bazaar</span> Admin
            </div>
            <span className="hidden sm:inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-sm font-medium text-muted-foreground hover:text-primary">
              View Store
            </Link>
            <Button variant="ghost" size="sm" onClick={logout} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-4xl mb-8 h-auto p-1 bg-muted">
            <TabsTrigger value="orders" className="py-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <ShoppingCart className="w-4 h-4 mr-2 hidden sm:block" /> Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="py-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Package className="w-4 h-4 mr-2 hidden sm:block" /> Products
            </TabsTrigger>
            <TabsTrigger value="categories" className="py-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Layers className="w-4 h-4 mr-2 hidden sm:block" /> Categories
            </TabsTrigger>
            <TabsTrigger value="banners" className="py-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <ImageIcon className="w-4 h-4 mr-2 hidden sm:block" /> Banners
            </TabsTrigger>
            <TabsTrigger value="settings" className="py-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Settings className="w-4 h-4 mr-2 hidden sm:block" /> Settings
            </TabsTrigger>
          </TabsList>

          <div className="bg-card border rounded-2xl shadow-sm min-h-[500px]">
            <TabsContent value="orders" className="m-0 focus-visible:outline-none">
              <OrdersTab />
            </TabsContent>
            <TabsContent value="products" className="m-0 focus-visible:outline-none">
              <ProductsTab />
            </TabsContent>
            <TabsContent value="categories" className="m-0 focus-visible:outline-none">
              <CategoriesTab />
            </TabsContent>
            <TabsContent value="banners" className="m-0 focus-visible:outline-none">
              <BannersTab />
            </TabsContent>
            <TabsContent value="settings" className="m-0 focus-visible:outline-none">
              <SettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { useProductById, useProducts } from '@/hooks/use-queries';
import { formatPKR } from '@/utils/helpers';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingBag, ShieldCheck, Truck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Route is /products/:id — products are identified by UUID id (no slug column)
export default function ProductDetail() {
  const [match, params] = useRoute('/products/:id');
  const id = params?.id || '';

  const { data: product, isLoading, error } = useProductById(id);
  const { data: relatedProducts } = useProducts({
    categoryId: product?.category_id,
    limit: 5,
  });

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/2 aspect-square bg-muted rounded-2xl" />
        <div className="w-full md:w-1/2 space-y-6 pt-8">
          <div className="h-10 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded w-1/4" />
          <div className="space-y-2 pt-6">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
          <div className="h-16 bg-muted rounded w-full mt-8" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">This product does not exist or has been removed.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const images: string[] = product.images && product.images.length > 0 ? product.images : [];
  const mainImage = images[activeImageIndex];

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: images[0] || '',
    });
    toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart`);
  };

  const filteredRelated = (relatedProducts || []).filter((p: any) => p.id !== product.id).slice(0, 4);

  return (
    <div className="flex-1 bg-background w-full py-8 md:py-12">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-muted-foreground mb-8">
          <a href="/" className="hover:text-primary transition-colors">Home</a>
          <ChevronRight className="w-4 h-4 mx-2" />
          <a href="/products" className="hover:text-primary transition-colors">Products</a>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 mb-20">

          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative border">
              {mainImage ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {(product as any).categories?.name && (
              <p className="text-sm text-accent font-semibold uppercase tracking-wider mb-3">
                {(product as any).categories.name}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-primary">
                {formatPKR(product.price)}
              </span>
            </div>

            <div className="prose prose-sm sm:prose-base text-muted-foreground mb-8">
              {product.description ? (
                <p className="whitespace-pre-line">{product.description}</p>
              ) : (
                <p>No description provided.</p>
              )}
            </div>

            <div className="border-t border-b py-6 mb-8 space-y-6">
              <div className="flex items-center gap-4">
                <span className="font-medium text-foreground min-w-[80px]">Quantity</span>
                <div className="flex items-center bg-muted rounded-full p-1 border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-background shadow-sm transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-background shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full text-base h-14 bg-primary hover:bg-primary/90"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-4 mt-auto">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                <Truck className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Cash on Delivery</h4>
                  <p className="text-xs text-muted-foreground mt-1">Available across Pakistan</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">100% Authentic</h4>
                  <p className="text-xs text-muted-foreground mt-1">Directly sourced</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {filteredRelated.length > 0 && (
          <div className="border-t pt-16">
            <h2 className="text-2xl font-serif font-bold mb-8 text-center">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRelated.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

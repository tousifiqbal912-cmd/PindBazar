import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { formatPKR } from '@/utils/helpers';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: any;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const mainImage = product.images?.[0] || '';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: mainImage,
    });
    toast.success(`${product.name} added to cart`);
  };

  // Products are linked by UUID id — no slug column exists
  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <motion.div
        whileHover={{ y: -4 }}
        className="h-full bg-card rounded-xl border overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300"
      >
        <div className="aspect-square relative overflow-hidden bg-muted">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/50 text-sm">
              No image
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">
            {product.categories?.name || 'Authentic Village Goods'}
          </div>
          <h3 className="font-serif font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>

          <div className="mt-auto pt-4 flex items-center justify-between">
            <span className="font-bold text-primary text-lg">
              {formatPKR(product.price)}
            </span>

            <button
              onClick={handleAddToCart}
              className="w-10 h-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors group/btn"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

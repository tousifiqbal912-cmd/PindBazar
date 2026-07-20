import React from 'react';
import { useHeroBanners, useCategories, useProducts } from '@/hooks/use-queries';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Truck, Leaf, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

export default function Home() {
  const { data: banners, isLoading: loadingBanners } = useHeroBanners(true);
  const { data: categories } = useCategories();
  const { data: featuredProducts, isLoading: loadingProducts } = useProducts({ limit: 8 });

  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  
  // Custom filtered products since API query only supports one param easily right now,
  // and we want featured on home page but filterable by tabs.
  // Filter by category (UUIDs are strings — no parseInt)
  const displayProducts = activeCategory
    ? featuredProducts?.filter((p: any) => p.category_id === activeCategory)
    : featuredProducts;

  // Hero Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  
  React.useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[400px] max-h-[600px] bg-secondary overflow-hidden">
        {loadingBanners ? (
          <div className="w-full h-full animate-pulse bg-muted flex items-center justify-center">
            <Leaf className="w-12 h-12 text-primary/20 animate-bounce" />
          </div>
        ) : banners && banners.length > 0 ? (
          <div className="overflow-hidden h-full" ref={emblaRef}>
            <div className="flex h-full">
              {banners.map((banner: any) => (
                <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative h-full">
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
                    <div className="container mx-auto px-4 lg:px-8">
                      <div className="max-w-xl text-white">
                        <motion.h1 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 leading-tight"
                        >
                          {banner.title}
                        </motion.h1>
                        {banner.subtitle && (
                          <motion.p 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg md:text-xl text-white/90 mb-8"
                          >
                            {banner.subtitle}
                          </motion.p>
                        )}
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Link href="/products" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-accent text-accent-foreground hover:bg-accent/90 h-11 px-8">
                            Shop Now
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white backdrop-blur transition"
              onClick={() => emblaApi?.scrollPrev()}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white backdrop-blur transition"
              onClick={() => emblaApi?.scrollNext()}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="w-full h-full relative overflow-hidden">
            {/* Rich gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a3d24] via-[#0F5132] to-[#1a6b40]" />
            {/* Decorative texture overlay */}
            <div className="absolute inset-0 opacity-10"
              style={{backgroundImage: 'radial-gradient(circle at 20% 80%, #D97706 0%, transparent 50%), radial-gradient(circle at 80% 20%, #D97706 0%, transparent 50%)'}}
            />
            {/* Wheat/grain pattern lines */}
            <div className="absolute inset-0 opacity-5"
              style={{backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px'}}
            />
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-6 max-w-3xl mx-auto">
                <div className="flex justify-center mb-6">
                  <img src="/logo.png" alt="PindBazaar" className="w-20 h-20 object-contain drop-shadow-lg" />
                </div>
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 leading-tight"
                >
                  Pure from the Village,<br />
                  <span className="text-[#D97706]">Delivered to Your Door</span>
                </motion.h1>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg md:text-xl text-white/85 mb-8 max-w-xl mx-auto"
                >
                  Authentic Desi Ghee, Natural Honey, Fresh Khajur and Cold-Pressed Oils — sourced directly from Pakistani villages.
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap gap-4 justify-center"
                >
                  <Link href="/products" className="inline-flex items-center justify-center rounded-lg font-semibold transition-all bg-[#D97706] text-white hover:bg-[#b86206] h-12 px-8 shadow-lg">
                    Shop Now
                  </Link>
                  <Link href="/about" className="inline-flex items-center justify-center rounded-lg font-semibold transition-all bg-white/15 backdrop-blur text-white border border-white/30 hover:bg-white/25 h-12 px-8">
                    Our Story
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-10 border-b">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl bg-secondary/30">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">100% Pure Village Sourced</h3>
                <p className="text-sm text-muted-foreground">Unadulterated & natural</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl bg-secondary/30">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Cash On Delivery</h3>
                <p className="text-sm text-muted-foreground">Nationwide delivery</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl bg-secondary/30">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Hand-picked Quality</h3>
                <p className="text-sm text-muted-foreground">Premium selection</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Our Premium Selection</h2>
            <p className="text-muted-foreground">Discover the authentic taste of pure ingredients, sourced directly from the heart of the village.</p>
          </div>

          {/* Category Tabs */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeCategory === null 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'bg-muted text-muted-foreground hover:bg-secondary'
                }`}
              >
                All Featured
              </button>
              {categories.map((category: any) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    activeCategory === category.id 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'bg-muted text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* Product Grid */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-[400px] bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : displayProducts && displayProducts.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {displayProducts.map((product: any) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    key={product.id}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-2xl border border-dashed">
              <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No featured products found in this category.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" variant="outline" className="font-medium text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                View All Products <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Story Teaser */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">From Village Fields to Your Doorstep</h2>
              <p className="text-primary-foreground/80 text-lg mb-8 leading-relaxed">
                We believe that the best food doesn't come from factories. It comes from the earth, nurtured by hands that have understood farming for generations. At PindBazaar, we bridge the gap between rural purity and urban convenience.
              </p>
              <Link href="/about">
                <Button variant="secondary" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 border-none">
                  Read Our Story
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20">
                <div className="text-4xl font-bold text-accent mb-2">100%</div>
                <div className="text-sm font-medium">Natural Ingredients</div>
              </div>
              <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20 mt-8">
                <div className="text-4xl font-bold text-accent mb-2">0%</div>
                <div className="text-sm font-medium">Added Preservatives</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

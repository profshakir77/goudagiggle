import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetFeaturedProducts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featuredProducts, isLoading } = useGetFeaturedProducts();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-primary/5 mix-blend-multiply" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-primary leading-tight">
              Joyful grazing for beautiful moments.
            </h1>
            <p className="mt-6 text-lg text-foreground/80 leading-relaxed">
              We craft artisanal charcuterie boards and grazing tables that smell like aged gouda and dried roses. Perfect for gifts, gatherings, and midnight cravings.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/shop" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                Shop Boards
              </Link>
              <Link href="/quote" className="inline-flex h-12 items-center justify-center rounded-md border border-primary/20 bg-background px-8 text-sm font-medium text-primary shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                Book a Grazing Table
              </Link>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl"
          >
            <img 
              src="/images/product-4.png" 
              alt="Large party grazing board" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary">Crowd Favorites</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">The boards that keep our neighborhood coming back for more.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="w-full aspect-[4/3] rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : (
              featuredProducts?.slice(0, 3).map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="group block cursor-pointer">
                  <div className="overflow-hidden rounded-xl bg-muted aspect-[4/3] relative">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-medium text-primary">${product.price.toFixed(2)}</span>
                      {product.serves && <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full">Serves {product.serves}</span>}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="mt-12 text-center">
            <Link href="/shop">
              <Button variant="outline" size="lg" className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View Entire Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <img src="/images/product-6.png" alt="Artisan ingredients" className="rounded-2xl shadow-xl w-full" />
            </div>
            <div>
              <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">Made like your best friend made it.</h2>
              <div className="space-y-6 text-primary-foreground/90">
                <p>At Gouda Giggles, we believe charcuterie shouldn't just be fancy—it should be fun. Every board is hand-crafted with premium, locally sourced ingredients and a serious sprinkle of joy.</p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold text-xl">✓</span>
                    <span>Artisanal cheeses selected for perfect pairings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold text-xl">✓</span>
                    <span>Fresh, seasonal fruits and gorgeous edible blooms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold text-xl">✓</span>
                    <span>Customizable for any allergy or dietary preference</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

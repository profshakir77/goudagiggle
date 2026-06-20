import { useState, useEffect } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag } from "lucide-react";

const CATEGORIES = ["All", "Charcuterie Board", "Grab & Go", "Charcuterie Cups", "Fruit Platters", "Add-Ons"];

export default function Shop() {
  const search = useSearch();
  const urlCategory = new URLSearchParams(search).get("category") ?? "All";
  const [activeCategory, setActiveCategory] = useState(
    CATEGORIES.includes(urlCategory) ? urlCategory : "All"
  );

  useEffect(() => {
    const cat = new URLSearchParams(search).get("category") ?? "All";
    setActiveCategory(CATEGORIES.includes(cat) ? cat : "All");
  }, [search]);
  const [, navigate] = useLocation();
  const { data: products, isLoading } = useListProducts(
    activeCategory !== "All" ? { category: activeCategory } : {}
  );
  const { addToCart } = useCart();

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    if (cat === "All") {
      navigate("/shop");
    } else {
      navigate(`/shop?category=${encodeURIComponent(cat)}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary">Our Menu</h1>
        <p className="mt-4 text-muted-foreground">Order online for local delivery or pickup. For grazing tables and large events, please request a quote.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            className="rounded-full"
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="w-full aspect-[4/3] rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full mt-2" />
            </div>
          ))
        ) : products?.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            No products found in this category.
          </div>
        ) : (
          products?.map((product) => (
            <div key={product.id} className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <Link href={`/product/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-muted">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <span className="font-bold text-lg">Sold Out</span>
                  </div>
                )}
              </Link>
              
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <Link href={`/product/${product.id}`} className="hover:underline">
                    <h3 className="font-serif text-lg font-bold text-foreground leading-tight">{product.name}</h3>
                  </Link>
                  <span className="font-medium text-primary whitespace-nowrap">${product.price.toFixed(2)}</span>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{product.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {product.serves ? `SERVES ${product.serves}` : product.category}
                  </span>
                  <Button 
                    size="sm" 
                    disabled={!product.inStock}
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(product, 1);
                    }}
                    className="rounded-full px-4"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" /> Add
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

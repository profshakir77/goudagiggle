import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetProduct } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/lib/cart-context";
import { Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "0", 10);
  const { data: product, isLoading, error } = useGetProduct(productId);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
          <div className="space-y-6 pt-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-3xl font-bold text-primary mb-4">Product not found</h2>
        <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or is currently unavailable.</p>
        <Link href="/shop">
          <Button variant="outline" className="border-primary text-primary">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    // Could add toast here
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/shop" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
      </Link>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        <div className="relative aspect-[4/3] md:aspect-square overflow-hidden rounded-2xl bg-muted shadow-lg">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
              <span className="font-serif font-bold text-3xl text-foreground">Sold Out</span>
            </div>
          )}
        </div>

        <div className="flex flex-col pt-2 md:pt-8">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary/80 bg-primary/10 px-3 py-1 rounded-full">
              {product.category}
            </span>
            {product.serves && (
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1 rounded-full">
                Serves {product.serves}
              </span>
            )}
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 leading-tight">
            {product.name}
          </h1>
          
          <div className="text-3xl font-medium text-primary mt-4">
            ${product.price.toFixed(2)}
          </div>
          
          <div className="w-full h-px bg-border my-8" />
          
          <div className="prose prose-sm sm:prose-base text-muted-foreground mb-8">
            <p>{product.description}</p>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium text-foreground">Quantity</span>
              <div className="flex items-center border border-border rounded-full p-1 bg-background">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || !product.inStock}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full" 
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!product.inStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full h-14 text-lg rounded-xl shadow-md hover:shadow-lg transition-all"
              disabled={!product.inStock}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              {product.inStock ? `Add to Cart - ${(product.price * quantity).toFixed(2)}` : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const [, setLocation] = useLocation();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg">
        <div className="bg-secondary/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold text-primary mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any delicious charcuterie to your cart yet.</p>
        <Link href="/shop">
          <Button size="lg" className="w-full sm:w-auto rounded-full">
            Browse our menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl font-bold text-primary mb-8">Your Cart</h1>
      
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.product.id} className="flex flex-col sm:flex-row gap-6 p-4 sm:p-6 bg-card border border-border rounded-2xl shadow-sm">
              <div className="w-full sm:w-32 aspect-square rounded-xl bg-muted overflow-hidden shrink-0">
                {item.product.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                )}
              </div>
              
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.product.category}</p>
                  </div>
                  <span className="font-bold text-primary">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex items-center border border-border rounded-full p-1 bg-background">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-full" 
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-full" 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-secondary/30 rounded-2xl p-6 md:p-8 sticky top-28 border border-primary/10">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({totalItems} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Taxes & Fees</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="pt-4 border-t border-border flex justify-between font-bold text-lg text-foreground">
                <span>Estimated Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full rounded-xl h-14 text-base"
              onClick={() => setLocation("/order")}
            >
              Proceed to Checkout <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <p className="mt-4 text-xs text-center text-muted-foreground">
              Taxes and delivery fees will be calculated on the next step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

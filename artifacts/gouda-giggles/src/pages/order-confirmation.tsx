import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id || "0", 10);
  const { data: order, isLoading } = useGetOrder(orderId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-lg text-center">
        <Skeleton className="h-20 w-20 rounded-full mx-auto mb-6" />
        <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-bold text-primary mb-4">Order Not Found</h1>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <div className="bg-primary/10 text-primary w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      
      <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
        Thank You, {order.customerName.split(' ')[0]}!
      </h1>
      
      <p className="text-lg text-muted-foreground mb-8">
        Your order has been received and is being prepared with joy.
      </p>

      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-left mb-8">
        <h2 className="font-bold text-xl mb-6 border-b border-border pb-4">Order Details</h2>
        
        <div className="grid grid-cols-2 gap-y-4 text-sm mb-8">
          <div className="text-muted-foreground">Order Number</div>
          <div className="font-medium text-right">#{order.id.toString().padStart(6, '0')}</div>
          
          <div className="text-muted-foreground">Date</div>
          <div className="font-medium text-right">{new Date(order.createdAt).toLocaleDateString()}</div>
          
          <div className="text-muted-foreground">Delivery</div>
          <div className="font-medium text-right">{order.deliveryAddress}</div>
          
          <div className="text-muted-foreground">Status</div>
          <div className="font-medium text-right capitalize text-primary">{order.status}</div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total Paid</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Link href="/">
        <Button variant="outline" size="lg" className="rounded-full">
          Return to Home
        </Button>
      </Link>
    </div>
  );
}

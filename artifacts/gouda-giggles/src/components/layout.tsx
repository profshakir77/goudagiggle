import React from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Navbar() {
  const [location] = useLocation();
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/gallery", label: "Gallery" },
    { href: "/quote", label: "Get a Quote" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-bold text-primary tracking-tight">Gouda Giggles</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>(555) 123-4567</span>
          </div>
          <Link href="/cart" className="relative group">
            <Button variant="outline" size="icon" className="rounded-full border-primary/20 hover:border-primary">
              <ShoppingBag className="h-5 w-5 text-primary group-hover:text-primary/80 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <Link href="/cart" className="relative">
            <ShoppingBag className="h-6 w-6 text-primary" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            className="text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background absolute w-full px-4 py-4 flex flex-col gap-4 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "block text-lg font-medium p-2 rounded-md transition-colors",
                location === link.href ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-primary font-medium">
            <Phone className="h-5 w-5" />
            <span>(555) 123-4567</span>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-secondary mt-20 border-t border-primary/10">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <span className="font-serif text-2xl font-bold text-primary tracking-tight">Gouda Giggles</span>
            <p className="mt-4 text-secondary-foreground/80 max-w-sm">
              Crafting joyful, artisanal charcuterie boards and grazing tables for New Jersey's most memorable moments.
            </p>
          </div>
          <div>
            <h4 className="font-serif font-bold text-primary text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-secondary-foreground/80 hover:text-primary transition-colors">Shop Boards</Link></li>
              <li><Link href="/gallery" className="text-secondary-foreground/80 hover:text-primary transition-colors">Gallery</Link></li>
              <li><Link href="/quote" className="text-secondary-foreground/80 hover:text-primary transition-colors">Event Quotes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-bold text-primary text-lg mb-4">Contact</h4>
            <ul className="space-y-2 text-secondary-foreground/80">
              <li>123 Artisan Way</li>
              <li>Hoboken, NJ 07030</li>
              <li>hello@goudagiggles.com</li>
              <li>(555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-primary/10 text-center text-sm text-secondary-foreground/60">
          © {new Date().getFullYear()} Gouda Giggles Charcuterie. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}

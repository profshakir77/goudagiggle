import React from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, Menu, X, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONTACT = {
  phone: "(415) 636-6046",
  email: "Goudagigglesalbany@outlook.com",
  address: "365 Troy Schenectady Road",
  city: "Latham, NY",
};

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
          <img
            src="/images/logo.png"
            alt="Gouda Giggles Charcuterie"
            className="h-14 w-auto"
          />
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
          <a
            href={`tel:${CONTACT.phone.replace(/\D/g, "")}`}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>{CONTACT.phone}</span>
          </a>
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
            <a href={`tel:${CONTACT.phone.replace(/\D/g, "")}`}>{CONTACT.phone}</a>
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
            <img src="/images/logo.png" alt="Gouda Giggles Charcuterie" className="h-16 w-auto mb-4" />
            <p className="mt-2 text-secondary-foreground/80 max-w-sm">
              Crafting joyful, artisanal charcuterie boards and grazing tables for Latham, NY and the Capital Region's most memorable moments.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-secondary-foreground/70">
              <a href={`tel:${CONTACT.phone.replace(/\D/g, "")}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4 shrink-0" /> {CONTACT.phone}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4 shrink-0" /> {CONTACT.email}
              </a>
              <span className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{CONTACT.address}, {CONTACT.city}</span>
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-serif font-bold text-primary text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-secondary-foreground/80 hover:text-primary transition-colors">Shop Charcuterie Boards</Link></li>
              <li><Link href="/shop?category=Grazing+Tables" className="text-secondary-foreground/80 hover:text-primary transition-colors">Grazing Tables</Link></li>
              <li><Link href="/shop?category=Workshops" className="text-secondary-foreground/80 hover:text-primary transition-colors">Workshops</Link></li>
              <li><Link href="/gallery" className="text-secondary-foreground/80 hover:text-primary transition-colors">Gallery</Link></li>
              <li><Link href="/quote" className="text-secondary-foreground/80 hover:text-primary transition-colors">Request an Event Quote</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-bold text-primary text-lg mb-4">Service Area</h4>
            <ul className="space-y-2 text-secondary-foreground/80 text-sm">
              <li>Latham, NY</li>
              <li>Albany, NY</li>
              <li>Schenectady, NY</li>
              <li>Troy, NY</li>
              <li>Capital Region, NY</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-primary/10 text-center text-sm text-secondary-foreground/60">
          © {new Date().getFullYear()} Gouda Giggles Charcuterie — Latham, NY. All rights reserved.
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

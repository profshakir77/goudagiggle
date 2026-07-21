import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, Menu, X, Phone, Mail, MapPin, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONTACT = {
  phone: "(415) 636-6046",
  phoneRaw: "14156366046",
  email: "Goudagigglesalbany@outlook.com",
  address: "365 Troy Schenectady Road",
  city: "Latham, NY",
  instagram: "https://www.instagram.com/goudagigglescharcuterie?igsh=OWJiYm5xaGN4eHBm&utm_source=qr",
  facebook: "https://www.facebook.com/share/1BdykeGz3r/?mibextid=wwXIfr",
  whatsapp: "https://wa.me/14156366046?text=Hi%20Gouda%20Giggles!%20I%27m%20interested%20in%20ordering%20a%20charcuterie%20board.",
};

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "w-5 h-5"} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
      <div className="container mx-auto px-4 h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/images/logo.webp"
            alt="Gouda Giggles Charcuterie"
            className="h-20 w-auto max-w-[220px] object-contain"
            width="220"
            height="80"
          />
        </Link>

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
            href={`tel:${CONTACT.phoneRaw}`}
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
            <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a>
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
            <img src="/images/logo.webp" alt="Gouda Giggles Charcuterie" className="h-16 w-auto mb-4" loading="lazy" width="180" height="64" />
            <p className="mt-2 text-secondary-foreground/80 max-w-sm">
              Crafting Joyful, Artisanal Charcuterie Boards And Grazing Tables For Latham, NY And The Capital Region's Most Memorable Moments.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-secondary-foreground/70">
              <a href={`tel:${CONTACT.phoneRaw}`} className="flex items-center gap-2 hover:text-primary transition-colors">
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
            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href={CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gouda Giggles Charcuterie on Instagram"
                className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <IconInstagram />
              </a>
              <a
                href={CONTACT.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gouda Giggles Charcuterie on Facebook"
                className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <IconFacebook />
              </a>
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with Gouda Giggles Charcuterie on WhatsApp"
                className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <IconWhatsApp />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-serif font-bold text-primary text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/shop?category=Charcuterie+Board" className="text-secondary-foreground/80 hover:text-primary transition-colors">Shop Charcuterie Boards</Link></li>
              <li><Link href="/shop?category=Fruit+Platters" className="text-secondary-foreground/80 hover:text-primary transition-colors">Fruit Platters</Link></li>
              <li><Link href="/quote" className="text-secondary-foreground/80 hover:text-primary transition-colors">Grazing Tables &amp; Workshops</Link></li>
              <li><Link href="/gallery" className="text-secondary-foreground/80 hover:text-primary transition-colors">Gallery</Link></li>
              <li><Link href="/quote" className="text-secondary-foreground/80 hover:text-primary transition-colors">Request an Event Quote</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-bold text-primary text-lg mb-4">Serving</h4>
            <ul className="space-y-2 text-secondary-foreground/80 text-sm">
              <li>Latham, NY</li>
              <li>Albany, NY</li>
              <li>Schenectady, NY</li>
              <li>Troy, NY</li>
              <li>Capital Region, NY</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-secondary-foreground/60">
          <span>© {new Date().getFullYear()} Gouda Giggles Charcuterie - Latham, NY. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-primary transition-colors"><IconInstagram /></a>
            <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-primary transition-colors"><IconFacebook /></a>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:text-primary transition-colors"><IconWhatsApp /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
      <span className="hidden group-hover:flex items-center bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
        Chat with us on WhatsApp
      </span>
      <a
        href="https://wa.me/14156366046?text=Hi%20Gouda%20Giggles!%20I%27m%20interested%20in%20ordering%20a%20charcuterie%20board."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Gouda Giggles Charcuterie on WhatsApp"
        className="w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center hover:bg-[#20ba58] transition-all duration-200 hover:scale-110 hover:shadow-2xl"
      >
        <IconWhatsApp className="w-7 h-7" />
      </a>
    </div>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-24 right-6 z-50 w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all duration-200 hover:scale-110",
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <WhatsAppButton />
      <BackToTop />
    </div>
  );
}

import { Link } from "wouter";
import { useGetFeaturedProducts, useListProducts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ChevronRight, Heart, Leaf, Sparkles, Clock } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    location: "Albany, NY",
    stars: 5,
    text: "Gouda Giggles made our baby shower! The board was absolutely stunning and tasted even better than it looked. Everyone kept asking where we ordered it.",
  },
  {
    name: "Jessica T.",
    location: "Latham, NY",
    stars: 5,
    text: "Ordered a medium board for our anniversary dinner and it was PERFECT. The presentation was gorgeous and the cheese and meat combos were spot on.",
  },
  {
    name: "Rachel K.",
    location: "Schenectady, NY",
    stars: 5,
    text: "We hired Gouda Giggles for our corporate event grazing table. 40 guests and not a crumb left! Professional, beautiful, and delicious.",
  },
];

const SERVICES = [
  {
    icon: "🧀",
    title: "Charcuterie Boards",
    description: "Small, medium, and large boards loaded with curated cheeses, cured meats, seasonal fruits, and house-made accompaniments.",
    href: "/shop",
    cta: "Shop Boards",
    image: "/images/product-1.webp",
  },
  {
    icon: "🌿",
    title: "Grazing Tables",
    description: "Stunning tableside spreads for weddings, bridal showers, and large celebrations - a full visual experience your guests will never forget.",
    href: "/quote",
    cta: "Get a Quote",
    image: "/images/product-4.webp",
  },
  {
    icon: "🍫",
    title: "Dessert Boards",
    description: "Chocolate-dipped strawberries, macarons, truffles, and seasonal sweets arranged into an indulgent dessert charcuterie board.",
    href: "/shop",
    cta: "Order Now",
    image: "/images/product-6.webp",
  },
];

const PROCESS = [
  { icon: <Heart className="w-7 h-7 text-primary" />, step: "01", title: "Choose Your Board", desc: "Pick from our menu of boards and grazing tables sized for your occasion." },
  { icon: <Clock className="w-7 h-7 text-primary" />, step: "02", title: "Place Your Order", desc: "Order online or request a custom quote. We confirm within 24 hours." },
  { icon: <Leaf className="w-7 h-7 text-primary" />, step: "03", title: "We Craft It Fresh", desc: "Every board is hand-built the day of your event using premium ingredients." },
  { icon: <Sparkles className="w-7 h-7 text-primary" />, step: "04", title: "Delivered to Your Door", desc: "We deliver across Latham, Albany, Troy, Schenectady & the Capital Region." },
];

export default function Home() {
  const { data: featuredProducts, isLoading: loadingFeatured } = useGetFeaturedProducts();
  const { data: allProducts, isLoading: loadingAll } = useListProducts();

  const displayProducts = featuredProducts?.slice(0, 6) ?? allProducts?.slice(0, 6) ?? [];
  const isLoading = loadingFeatured && loadingAll;

  return (
    <div className="w-full">

      {/* Hero Section — CSS animated, no JS library */}
      <section className="relative w-full overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-primary/5 mix-blend-multiply" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl animate-fade-in-up">
            <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide">Latham, NY · Capital Region</span>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-primary leading-tight">
              Joyful Grazing For Beautiful Moments.
            </h1>
            <p className="mt-3 text-base font-semibold text-primary/70 tracking-wide">
              Serving Entire Capital Region and Surroundings
            </p>
            <p className="mt-4 text-lg text-foreground/80 leading-relaxed">
              Artisanal charcuterie boards and grazing tables crafted with love for gifts, gatherings, weddings, and every celebration in between.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/shop" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                Shop Boards
              </Link>
              <Link href="/quote" className="inline-flex h-12 items-center justify-center rounded-md border border-primary/20 bg-background px-8 text-sm font-medium text-primary shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                Book a Grazing Table
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <span className="font-medium text-foreground">5-star rated</span>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[550px] w-full rounded-2xl overflow-hidden shadow-2xl animate-fade-in-scale">
            <img
              src="/images/product-4.webp"
              alt="Large party grazing board by Gouda Giggles Charcuterie Latham NY"
              className="absolute inset-0 w-full h-full object-cover"
              fetchPriority="high"
              decoding="sync"
              width="800"
              height="550"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-xl p-4 shadow-lg">
              <p className="font-serif text-primary font-bold text-lg">🧀 Now taking orders!</p>
              <p className="text-sm text-muted-foreground">Custom boards for any occasion. Order online or call <a href="tel:4156366046" className="text-primary font-medium">(415) 636-6046</a></p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary">What We Create</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">From intimate date nights to 50-person wedding grazing tables - we've got your celebration covered.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {SERVICES.map((s) => (
              <Link key={s.title} href={s.href} className="group block bg-secondary rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width="400" height="300" />
                </div>
                <div className="p-6">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <h3 className="font-serif text-xl font-bold text-primary mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                    {s.cta} <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary">Our Menu</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Every board is made fresh to order. Choose your size, add-ons, and let us do the rest.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <Skeleton className="w-full aspect-[4/3] rounded-xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              : displayProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group block cursor-pointer bg-background rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                    <div className="overflow-hidden aspect-[4/3] relative">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          width="400"
                          height="300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted text-5xl">🧀</div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-bold text-primary text-lg">${product.price.toFixed(2)}</span>
                        {product.serves && (
                          <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full">Serves {product.serves}</span>
                        )}
                      </div>
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                          Order Now <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/shop">
              <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-10">
                View Full Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary">How It Works</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Ordering your dream charcuterie board is simple.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS.map((p) => (
              <div key={p.step} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  {p.icon}
                </div>
                <span className="text-xs font-bold text-primary/50 tracking-widest">STEP {p.step}</span>
                <h3 className="font-serif text-lg font-bold text-foreground mt-1 mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <img src="/images/product-6.webp" alt="Artisan charcuterie ingredients Latham NY" className="rounded-2xl shadow-xl w-full" loading="lazy" width="600" height="450" />
            </div>
            <div>
              <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">Made like your best friend made it.</h2>
              <div className="space-y-6 text-primary-foreground/90">
                <p>At Gouda Giggles, we believe charcuterie shouldn't just be fancy - it should be fun. Every board is hand-crafted with premium, locally sourced ingredients and a serious sprinkle of joy.</p>
                <ul className="space-y-4">
                  {[
                    "Artisanal cheeses selected for perfect pairings",
                    "Fresh, seasonal fruits and gorgeous edible blooms",
                    "Customizable for any allergy or dietary preference",
                    "Delivered fresh across the Capital Region, NY",
                    "Perfect for weddings, birthdays, showers & corporate events",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-accent font-bold text-xl mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  <Link href="/quote" className="inline-flex h-12 items-center justify-center rounded-md bg-white text-primary px-8 text-sm font-semibold hover:bg-white/90 transition-colors">
                    Book Your Event
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary">Happy Grazers</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Don't just take our word for it - here's what our customers are saying.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-background rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex mb-4">
                  {[...Array(t.stars)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-foreground/80 leading-relaxed italic mb-6">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Teaser */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary">From Our Kitchen to Yours</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">A peek at the boards that made it to the table.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["/images/gallery-1.webp", "/images/gallery-2.webp", "/images/gallery-3.webp", "/images/gallery-4.webp"].map((img, i) => (
              <Link key={i} href="/gallery" className="group overflow-hidden rounded-xl aspect-square block">
                <img src={img} alt={`Gouda Giggles charcuterie board ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" width="300" height="300" />
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/gallery">
              <Button variant="outline" size="lg" className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                See Full Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4">Ready to build your dream board?</h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">Order online today or get in touch for a custom grazing table quote for your next event.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop" className="inline-flex h-12 items-center justify-center rounded-md bg-white text-primary px-8 text-sm font-semibold hover:bg-white/90 transition-colors">
              Shop Now
            </Link>
            <Link href="/quote" className="inline-flex h-12 items-center justify-center rounded-md border-2 border-white text-white px-8 text-sm font-semibold hover:bg-white/10 transition-colors">
              Get a Quote
            </Link>
          </div>
          <p className="mt-8 text-primary-foreground/60 text-sm">Call or text: <a href="tel:4156366046" className="text-white underline">(415) 636-6046</a> · Serving Latham, Albany, Troy, Schenectady &amp; the Capital Region</p>
        </div>
      </section>

    </div>
  );
}

import { db, productsTable, galleryTable } from "@workspace/db";

async function seed() {
  console.log("Seeding Gouda Giggles database...");

  // Check if already seeded
  const existingProducts = await db.select().from(productsTable);
  if (existingProducts.length > 0) {
    console.log("Database already seeded, skipping.");
    process.exit(0);
  }

  // Products
  await db.insert(productsTable).values([
    {
      name: "Classic Charcuterie Board",
      description: "Our signature board loaded with premium cured meats, artisan cheeses, fresh grapes, honeycomb, olives, crackers, and seasonal accompaniments. Perfect for intimate gatherings and date nights.",
      price: "65.00",
      category: "Boards",
      serves: "Serves 2-4",
      imageUrl: null,
      inStock: true,
      featured: true,
    },
    {
      name: "Party Charcuterie Board",
      description: "Go big with this crowd-pleasing board featuring a generous spread of cured meats, triple-cream brie, aged cheddar, gouda, fresh berries, dried fruits, nuts, and an abundance of crackers and breadsticks.",
      price: "120.00",
      category: "Boards",
      serves: "Serves 6-8",
      imageUrl: null,
      inStock: true,
      featured: true,
    },
    {
      name: "Sweet Dessert Board",
      description: "Indulge in our all-sweet board featuring chocolate-dipped strawberries, macarons, fudge bites, truffles, seasonal fruits, and a selection of gourmet chocolates. A showstopper at any celebration.",
      price: "80.00",
      category: "Boards",
      serves: "Serves 4-6",
      imageUrl: null,
      inStock: true,
      featured: true,
    },
    {
      name: "Mini Grazing Table (up to 25 guests)",
      description: "A stunning tableside grazing experience for intimate events. We set up a beautifully styled display of cheeses, charcuterie, fruits, dips, breads, and seasonal florals directly at your venue.",
      price: "350.00",
      category: "Grazing Tables",
      serves: "Up to 25 guests",
      imageUrl: null,
      inStock: true,
      featured: true,
    },
    {
      name: "Grand Grazing Table (up to 75 guests)",
      description: "Our most luxurious offering — a full-length grazing table that becomes the centerpiece of your event. Includes premium meats, imported cheeses, seasonal produce, dips, breads, and floral accents.",
      price: "950.00",
      category: "Grazing Tables",
      serves: "Up to 75 guests",
      imageUrl: null,
      inStock: true,
      featured: false,
    },
    {
      name: "Charcuterie Workshop",
      description: "Learn the art of board building in this hands-on workshop! You'll create your own beautiful charcuterie board to take home while enjoying wine, great company, and expert tips. Perfect for date nights, bachelorette parties, and team events.",
      price: "75.00",
      category: "Workshops",
      serves: "Per person",
      imageUrl: null,
      inStock: true,
      featured: false,
    },
    {
      name: "Seasonal Fruit Add-on",
      description: "Elevate any board with a curated selection of fresh seasonal fruits — strawberries, raspberries, grapes, figs, and melon artfully arranged to complement your charcuterie.",
      price: "18.00",
      category: "Add-ons",
      serves: "Serves 2-4",
      imageUrl: null,
      inStock: true,
      featured: false,
    },
    {
      name: "Cheese Lover Board",
      description: "A curated all-cheese board featuring six artisan varieties — soft brie, aged manchego, creamy gorgonzola, sharp cheddar, smoky gouda, and fresh burrata — with honeycomb, fig jam, and assorted crackers.",
      price: "90.00",
      category: "Boards",
      serves: "Serves 4-6",
      imageUrl: null,
      inStock: true,
      featured: false,
    },
  ]);

  // Gallery images (using placeholder food photography descriptions)
  await db.insert(galleryTable).values([
    {
      url: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800&q=80",
      caption: "Artisan charcuterie board with seasonal accompaniments",
      category: "Boards",
    },
    {
      url: "https://images.unsplash.com/photo-1612240498936-65f5101365d2?w=800&q=80",
      caption: "Grand grazing table for a wedding reception",
      category: "Grazing Tables",
    },
    {
      url: "https://images.unsplash.com/photo-1559561853-08451507cbe7?w=800&q=80",
      caption: "Dessert board with macarons and fresh berries",
      category: "Boards",
    },
    {
      url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
      caption: "Charcuterie workshop in action",
      category: "Workshops",
    },
    {
      url: "https://images.unsplash.com/photo-1575895943891-58d3823aa9b0?w=800&q=80",
      caption: "Elegant bridal shower grazing table",
      category: "Grazing Tables",
    },
    {
      url: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=800&q=80",
      caption: "Classic board for a birthday celebration",
      category: "Boards",
    },
    {
      url: "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=800&q=80",
      caption: "Cheese and charcuterie spread with florals",
      category: "Boards",
    },
    {
      url: "https://images.unsplash.com/photo-1549497538-303791108f95?w=800&q=80",
      caption: "Corporate event grazing station",
      category: "Grazing Tables",
    },
  ]);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

import { db, productsTable } from "@workspace/db";
import { logger } from "./lib/logger";

const PRODUCTS = [
  {
    name: "Small Charcuterie Board",
    description:
      "Our hand-crafted small charcuterie board is perfect for intimate gatherings and date nights in the Capital Region. Loaded with premium cured meats, artisan cheeses, fresh seasonal fruits, house-made jam, honey, nuts, and gourmet crackers. A stunning centerpiece for any occasion in Latham, Albany, and surrounding areas.",
    price: "85.00",
    category: "Charcuterie Board",
    serves: "2-4 guests",
    imageUrl: "/images/cat-charcuterie-board.webp",
    inStock: true,
    featured: true,
  },
  {
    name: "Medium Charcuterie Board",
    description:
      "Our crowd-pleasing medium charcuterie board is ideal for birthday parties, bridal showers, and family gatherings across Albany and the Capital Region. Features a generous spread of cured salami, prosciutto, artisan cheeses, fresh grapes, seasonal berries, dried fruits, candied nuts, spreads, and artisan crackers — beautifully arranged for maximum impact.",
    price: "150.00",
    category: "Charcuterie Board",
    serves: "6-10 guests",
    imageUrl: "/images/cat-charcuterie-board.webp",
    inStock: true,
    featured: true,
  },
  {
    name: "Large Charcuterie Board",
    description:
      "Our impressive large charcuterie board is the ultimate showstopper for corporate events, holiday parties, and milestone celebrations throughout the Capital Region NY. An abundant display of premium imported meats, aged and artisan cheeses, seasonal produce, edible florals, house-made accompaniments, and gourmet crackers — crafted fresh the day of your event.",
    price: "220.00",
    category: "Charcuterie Board",
    serves: "12-20 guests",
    imageUrl: "/images/cat-charcuterie-board.webp",
    inStock: true,
    featured: true,
  },
  {
    name: "Grab & Go Small",
    description:
      "Our Grab & Go small snack box is perfect for on-the-move snacking, office lunches, and individual gifts. Each box is packed with rolled premium meats, cubed artisan cheeses, fresh grapes, crunchy crackers, and a sweet treat — all neatly packaged and ready to enjoy anywhere in the Capital Region.",
    price: "20.00",
    category: "Grab & Go",
    serves: "1 person",
    imageUrl: "/images/cat-grab-and-go.webp",
    inStock: true,
    featured: false,
  },
  {
    name: "Grab & Go Large",
    description:
      "Our Grab & Go large snack box is a hearty individual spread for those who love variety. Loaded with premium cured meats, a selection of artisan cheeses, seasonal fruits, nuts, olives, gourmet crackers, and house-made jam — a perfect grab-and-go gift or personal treat from Gouda Giggles in Latham, NY.",
    price: "36.00",
    category: "Grab & Go",
    serves: "1-2 persons",
    imageUrl: "/images/cat-grab-and-go.webp",
    inStock: true,
    featured: false,
  },
  {
    name: "Classic Charcuterie Cup",
    description:
      "Our Classic Charcuterie Cup is a fun, individually portioned appetizer perfect for cocktail parties, wedding receptions, and events across the Capital Region. Each cup features rolled salami, sharp cheddar cubes, fresh grape tomatoes, olives, and crispy crackers — elegant, mess-free, and absolutely delicious.",
    price: "13.50",
    category: "Charcuterie Cups",
    serves: "1 person",
    imageUrl: "/images/cat-charcuterie-cup.webp",
    inStock: true,
    featured: true,
  },
  {
    name: "Premium Charcuterie Cup",
    description:
      "Our Premium Charcuterie Cup elevates any event with a luxury selection of imported prosciutto, artisan brie and manchego, marinated olives, fresh berries, and gourmet crackers — all beautifully arranged in a single serving cup. Perfect for upscale gatherings, bridal showers, and corporate events in Albany and the Capital Region.",
    price: "20.50",
    category: "Charcuterie Cups",
    serves: "1 person",
    imageUrl: "/images/cat-charcuterie-cup.webp",
    inStock: true,
    featured: true,
  },
  {
    name: "Small Fruit Platter",
    description:
      "Our small fresh fruit platter is a vibrant, colorful centerpiece for any gathering in the Capital Region. Featuring a hand-selected seasonal medley of strawberries, blueberries, raspberries, kiwi, melon, and grapes — beautifully arranged and ready to impress. A refreshing complement to any charcuterie spread.",
    price: "75.00",
    category: "Fruit Platters",
    serves: "6-10 guests",
    imageUrl: "/images/cat-fruit-platter.webp",
    inStock: true,
    featured: false,
  },
  {
    name: "Medium Fruit Platter",
    description:
      "Our medium fresh fruit platter is perfect for birthday parties, baby showers, and holiday events across Albany and Latham NY. A generous, stunning arrangement of premium seasonal fruits including strawberries, blueberries, raspberries, cantaloupe, honeydew, pineapple, and grapes — fresh, vibrant, and delicious.",
    price: "125.00",
    category: "Fruit Platters",
    serves: "12-16 guests",
    imageUrl: "/images/cat-fruit-platter.webp",
    inStock: true,
    featured: false,
  },
  {
    name: "Large Fruit Platter",
    description:
      "Our large fresh fruit platter is an impressive, show-stopping display for weddings, corporate events, and large celebrations across the Capital Region. Packed with an abundant selection of premium seasonal fruits — a beautiful and healthy centerpiece that pairs perfectly with any of our charcuterie boards or grazing tables.",
    price: "165.00",
    category: "Fruit Platters",
    serves: "18-24 guests",
    imageUrl: "/images/cat-fruit-platter.webp",
    inStock: true,
    featured: false,
  },
  {
    name: "Chocolate Add-On",
    description:
      "Elevate your Gouda Giggles board with our indulgent chocolate add-on. Choose from chocolate-dipped strawberries, dark chocolate truffles, milk chocolate bark, and chocolate-covered nuts — the perfect sweet finishing touch to any board or grazing table in the Capital Region.",
    price: "15.00",
    category: "Add-Ons",
    serves: null,
    imageUrl: "/images/cat-chocolates.webp",
    inStock: true,
    featured: false,
  },
];

export async function seedProducts() {
  try {
    const existing = await db.select().from(productsTable);

    const hasCorrectData = existing.some((p) =>
      ["Charcuterie Board", "Grab & Go", "Charcuterie Cups", "Fruit Platters"].includes(p.category)
    );

    if (hasCorrectData && existing.length === PRODUCTS.length) {
      logger.info("Products already seeded — skipping");
      return;
    }

    logger.info("Seeding products...");
    await db.delete(productsTable);

    for (const product of PRODUCTS) {
      await db.insert(productsTable).values(product);
    }

    logger.info({ count: PRODUCTS.length }, "Products seeded successfully");
  } catch (err) {
    logger.error({ err }, "Failed to seed products");
  }
}

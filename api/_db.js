import { drizzle } from "drizzle-orm/node-postgres";
import {
  pgTable, serial, text, boolean, numeric, jsonb, timestamp, integer,
} from "drizzle-orm/pg-core";
import pkg from "pg";
const { Pool } = pkg;

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  serves: text("serves"),
  imageUrl: text("image_url"),
  featured: boolean("featured").notNull().default(false),
  inStock: boolean("in_stock").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  eventDate: text("event_date").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  specialInstructions: text("special_instructions"),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull().default("card"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  items: jsonb("items").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const galleryTable = pgTable("gallery", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  caption: text("caption").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quotesTable = pgTable("quotes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  eventType: text("event_type").notNull(),
  eventDate: text("event_date").notNull(),
  guestCount: integer("guest_count").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

let _db;
export function getDb() {
  if (!_db) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    _db = drizzle(pool, { schema: { productsTable, ordersTable, galleryTable, quotesTable } });
  }
  return _db;
}

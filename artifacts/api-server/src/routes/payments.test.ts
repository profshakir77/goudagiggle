import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// ---------------------------------------------------------------------------
// vi.hoisted ensures these are initialised before vi.mock factories run
// ---------------------------------------------------------------------------
const { mockWhere, mockFrom, mockSelect, mockReturning, mockValues, mockInsert } =
  vi.hoisted(() => {
    const mockWhere = vi.fn();
    const mockFrom = vi.fn(() => ({ where: mockWhere }));
    const mockSelect = vi.fn(() => ({ from: mockFrom }));

    const mockReturning = vi.fn();
    const mockValues = vi.fn(() => ({ returning: mockReturning }));
    const mockInsert = vi.fn(() => ({ values: mockValues }));

    return { mockWhere, mockFrom, mockSelect, mockReturning, mockValues, mockInsert };
  });

// ---------------------------------------------------------------------------
// Mock @workspace/db BEFORE importing the app so the route module never tries
// to connect to a real database.
// ---------------------------------------------------------------------------
vi.mock("@workspace/db", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
  },
  productsTable: {},
  ordersTable: {},
  eq: vi.fn(),
}));

// Mock Square so no real network calls are made
vi.mock("square", () => ({
  Client: vi.fn(() => ({})),
  Environment: { Sandbox: "sandbox", Production: "production" },
}));

// Suppress the fire-and-forget email notification
vi.mock("../lib/email.js", () => ({
  sendOrderNotificationEmail: vi.fn().mockResolvedValue(undefined),
}));

// ---------------------------------------------------------------------------
// Import app AFTER mocks are set up
// ---------------------------------------------------------------------------
import app from "../app.js";

// ---------------------------------------------------------------------------
// Minimal valid COD payload
// ---------------------------------------------------------------------------
const validPayload = {
  paymentMethod: "cod",
  customerName: "Jane Doe",
  customerEmail: "jane@example.com",
  customerPhone: "555-0100",
  eventDate: "2026-08-01",
  deliveryAddress: "123 Main St",
  items: [{ productId: 1, quantity: 2 }],
};

const mockProduct = {
  id: 1,
  name: "Cheese Board",
  price: "45.00",
  inStock: true,
};

const mockOrder = {
  id: 42,
  customerName: "Jane Doe",
  customerEmail: "jane@example.com",
  customerPhone: "555-0100",
  eventDate: "2026-08-01",
  deliveryAddress: "123 Main St",
  specialInstructions: null,
  status: "pending",
  paymentMethod: "cod",
  total: "90.00",
  items: [{ productId: 1, quantity: 2 }],
  createdAt: new Date("2026-07-21T00:00:00Z"),
};

describe("POST /api/payments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore the insert chain after clearAllMocks resets implementations
    mockValues.mockReturnValue({ returning: mockReturning });
    mockInsert.mockReturnValue({ values: mockValues });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSelect.mockReturnValue({ from: mockFrom });
    // Default: db.insert resolves with the mock order
    mockReturning.mockResolvedValue([mockOrder]);
  });

  it("returns 400 when the productId is not found in the database", async () => {
    // Simulate a product lookup that finds no rows
    mockWhere.mockResolvedValue([]);

    const res = await request(app)
      .post("/api/payments")
      .send({ ...validPayload, items: [{ productId: 9999, quantity: 1 }] });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Product not found: 9999/);
  });

  it("returns 400 when the product is out of stock", async () => {
    // Simulate finding the product but with inStock = false
    mockWhere.mockResolvedValue([{ ...mockProduct, inStock: false }]);

    const res = await request(app).post("/api/payments").send(validPayload);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Product is out of stock: Cheese Board/);
  });

  it("returns 201 and creates the order for a valid COD submission", async () => {
    // Simulate finding an in-stock product
    mockWhere.mockResolvedValue([mockProduct]);

    const res = await request(app).post("/api/payments").send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(42);
    expect(res.body.status).toBe("pending");
    expect(res.body.paymentMethod).toBe("cod");
    expect(res.body.total).toBe(90);
  });
});

import {
  bigint,
  boolean,
  datetime,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table - Stores mug products with their base information and pricing
 */
export const products = mysqlTable("products", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  basePrice: int("basePrice").notNull(), // Price in cents to avoid decimal issues
  sku: varchar("sku", { length: 100 }).unique().notNull(),
  category: varchar("category", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Stock table - Tracks inventory levels for each product
 */
export const stock = mysqlTable("stock", {
  id: varchar("id", { length: 64 }).primaryKey(),
  productId: varchar("productId", { length: 64 }).notNull(),
  quantity: int("quantity").notNull().default(0),
  minimumLevel: int("minimumLevel").default(10),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow(),
});

export type Stock = typeof stock.$inferSelect;
export type InsertStock = typeof stock.$inferInsert;

/**
 * Orders table - Stores customer orders with pricing and discount information
 */
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).unique().notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 20 }),
  status: mysqlEnum("status", [
    "pending",
    "processing",
    "ready",
    "shipped",
    "delivered",
    "cancelled",
  ])
    .default("pending")
    .notNull(),
  subtotal: int("subtotal").notNull(), // Sum of products + services in cents
  discount: int("discount").default(0).notNull(), // Discount amount in cents
  discountPercentage: int("discountPercentage").default(0).notNull(), // Discount percentage (0-100)
  total: int("total").notNull(), // Final total in cents (subtotal - discount)
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order Items table - Individual products in an order
 */
export const orderItems = mysqlTable("orderItems", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  productId: varchar("productId", { length: 64 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(), // Price per unit in cents
  subtotal: int("subtotal").notNull(), // quantity * unitPrice
  createdAt: timestamp("createdAt").defaultNow(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Order Services table - Additional services for an order (customization, personalization, etc.)
 */
export const orderServices = mysqlTable("orderServices", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  serviceName: varchar("serviceName", { length: 255 }).notNull(),
  description: text("description"),
  price: int("price").notNull(), // Service price in cents
  createdAt: timestamp("createdAt").defaultNow(),
});

export type OrderService = typeof orderServices.$inferSelect;
export type InsertOrderService = typeof orderServices.$inferInsert;

/**
 * Design Uploads table - Stores customer-uploaded designs for personalization
 */
export const designUploads = mysqlTable("designUploads", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(), // S3 URL
  fileSize: int("fileSize").notNull(), // Size in bytes
  mimeType: varchar("mimeType", { length: 100 }),
  uploadedAt: timestamp("uploadedAt").defaultNow(),
});

export type DesignUpload = typeof designUploads.$inferSelect;
export type InsertDesignUpload = typeof designUploads.$inferInsert;

/**
 * Stock Movement Log - Audit trail for inventory changes
 */
export const stockMovements = mysqlTable("stockMovements", {
  id: varchar("id", { length: 64 }).primaryKey(),
  productId: varchar("productId", { length: 64 }).notNull(),
  orderId: varchar("orderId", { length: 64 }),
  movementType: mysqlEnum("movementType", [
    "purchase",
    "sale",
    "adjustment",
    "return",
  ])
    .notNull(),
  quantity: int("quantity").notNull(),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = typeof stockMovements.$inferInsert;


import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  products,
  stock,
  orders,
  orderItems,
  orderServices,
  designUploads,
  stockMovements,
  Product,
  Stock,
  Order,
  OrderItem,
  OrderService,
  DesignUpload,
  StockMovement,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = "admin";
        values.role = "admin";
        updateSet.role = "admin";
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// PRODUCT OPERATIONS
// ============================================================================

export async function createProduct(data: {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  sku: string;
  category?: string;
}): Promise<Product> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(products).values({
    id: data.id,
    name: data.name,
    description: data.description,
    basePrice: data.basePrice,
    sku: data.sku,
    category: data.category,
  });

  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, data.id))
    .limit(1);

  return result[0];
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return result[0];
}

export async function getProductBySku(sku: string): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(products)
    .where(eq(products.sku, sku))
    .limit(1);

  return result[0];
}

export async function listProducts(filters?: {
  category?: string;
  isActive?: boolean;
}): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];

  let query: any = db.select().from(products);

  if (filters?.category) {
    query = query.where(eq(products.category, filters.category));
  }
  if (filters?.isActive !== undefined) {
    query = query.where(eq(products.isActive, filters.isActive));
  }

  return query;
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    basePrice: number;
    category: string;
    isActive: boolean;
  }>
): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(products).set(data).where(eq(products.id, id));

  return getProduct(id);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.delete(products).where(eq(products.id, id));
  return true;
}

// ============================================================================
// STOCK OPERATIONS
// ============================================================================

export async function initializeStock(
  productId: string,
  quantity: number,
  minimumLevel?: number
): Promise<Stock> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db.insert(stock).values({
    id,
    productId,
    quantity,
    minimumLevel: minimumLevel || 10,
  });

  const result = await db
    .select()
    .from(stock)
    .where(eq(stock.id, id))
    .limit(1);

  return result[0];
}

export async function getStock(productId: string): Promise<Stock | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(stock)
    .where(eq(stock.productId, productId))
    .limit(1);

  return result[0];
}

export async function updateStockQuantity(
  productId: string,
  newQuantity: number
): Promise<Stock | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db
    .update(stock)
    .set({ quantity: newQuantity })
    .where(eq(stock.productId, productId));

  return getStock(productId);
}

export async function decreaseStock(
  productId: string,
  quantity: number,
  orderId?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const currentStock = await getStock(productId);
  if (!currentStock || currentStock.quantity < quantity) {
    return false;
  }

  const newQuantity = currentStock.quantity - quantity;
  await updateStockQuantity(productId, newQuantity);

  // Log the movement
  const movementId = `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(stockMovements).values({
    id: movementId,
    productId,
    orderId,
    movementType: "sale",
    quantity,
    reason: orderId ? `Venda do pedido ${orderId}` : "Venda",
  });

  return true;
}

export async function increaseStock(
  productId: string,
  quantity: number,
  reason?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const currentStock = await getStock(productId);
  if (!currentStock) return false;

  const newQuantity = currentStock.quantity + quantity;
  await updateStockQuantity(productId, newQuantity);

  // Log the movement
  const movementId = `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(stockMovements).values({
    id: movementId,
    productId,
    movementType: "adjustment",
    quantity,
    reason: reason || "Ajuste de estoque",
  });

  return true;
}

// ============================================================================
// ORDER OPERATIONS
// ============================================================================

export async function createOrder(data: {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  subtotal: number;
  discount?: number;
  discountPercentage?: number;
  notes?: string;
}): Promise<Order> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const discount = data.discount || 0;
  const total = data.subtotal - discount;

  await db.insert(orders).values({
    id: data.id,
    orderNumber: data.orderNumber,
    userId: data.userId,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    subtotal: data.subtotal,
    discount,
    discountPercentage: data.discountPercentage || 0,
    total,
    notes: data.notes,
  });

  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.id, data.id))
    .limit(1);

  return result[0];
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  return result[0];
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);

  return result[0];
}

export async function listOrders(filters?: {
  userId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];

  let query: any = db.select().from(orders);

  if (filters?.userId) {
    query = query.where(eq(orders.userId, filters.userId));
  }
  if (filters?.status) {
    query = query.where(eq(orders.status, filters.status as any));
  }

  query = query.orderBy(desc(orders.createdAt));

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return query;
}

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));

  return getOrder(id);
}

export async function updateOrderTotal(
  id: string,
  subtotal: number,
  discount: number,
  discountPercentage: number
): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const total = subtotal - discount;

  await db
    .update(orders)
    .set({
      subtotal,
      discount,
      discountPercentage,
      total,
    })
    .where(eq(orders.id, id));

  return getOrder(id);
}

// ============================================================================
// ORDER ITEM OPERATIONS
// ============================================================================

export async function addOrderItem(data: {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}): Promise<OrderItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const subtotal = data.quantity * data.unitPrice;

  await db.insert(orderItems).values({
    id: data.id,
    orderId: data.orderId,
    productId: data.productId,
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    subtotal,
  });

  const result = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.id, data.id))
    .limit(1);

  return result[0];
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function removeOrderItem(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.delete(orderItems).where(eq(orderItems.id, id));
  return true;
}

// ============================================================================
// ORDER SERVICE OPERATIONS
// ============================================================================

export async function addOrderService(data: {
  id: string;
  orderId: string;
  serviceName: string;
  description?: string;
  price: number;
}): Promise<OrderService> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(orderServices).values({
    id: data.id,
    orderId: data.orderId,
    serviceName: data.serviceName,
    description: data.description,
    price: data.price,
  });

  const result = await db
    .select()
    .from(orderServices)
    .where(eq(orderServices.id, data.id))
    .limit(1);

  return result[0];
}

export async function getOrderServices(orderId: string): Promise<OrderService[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(orderServices).where(eq(orderServices.orderId, orderId));
}

export async function removeOrderService(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.delete(orderServices).where(eq(orderServices.id, id));
  return true;
}

// ============================================================================
// DESIGN UPLOAD OPERATIONS
// ============================================================================

export async function addDesignUpload(data: {
  id: string;
  orderId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType?: string;
}): Promise<DesignUpload> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(designUploads).values({
    id: data.id,
    orderId: data.orderId,
    fileName: data.fileName,
    fileUrl: data.fileUrl,
    fileSize: data.fileSize,
    mimeType: data.mimeType,
  });

  const result = await db
    .select()
    .from(designUploads)
    .where(eq(designUploads.id, data.id))
    .limit(1);

  return result[0];
}

export async function getDesignUploads(orderId: string): Promise<DesignUpload[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(designUploads).where(eq(designUploads.orderId, orderId));
}

export async function removeDesignUpload(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.delete(designUploads).where(eq(designUploads.id, id));
  return true;
}

// ============================================================================
// STOCK MOVEMENT OPERATIONS
// ============================================================================

export async function getStockMovements(
  productId?: string,
  orderId?: string
): Promise<StockMovement[]> {
  const db = await getDb();
  if (!db) return [];

  let query: any = db.select().from(stockMovements);

  if (productId) {
    query = query.where(eq(stockMovements.productId, productId));
  }
  if (orderId) {
    query = query.where(eq(stockMovements.orderId, orderId));
  }

  return query.orderBy(desc(stockMovements.createdAt));
}


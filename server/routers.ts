import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  createProduct,
  getProduct,
  getProductBySku,
  listProducts,
  updateProduct,
  deleteProduct,
  initializeStock,
  getStock,
  updateStockQuantity,
  decreaseStock,
  increaseStock,
  createOrder,
  getOrder,
  getOrderByNumber,
  listOrders,
  updateOrderStatus,
  updateOrderTotal,
  addOrderItem,
  getOrderItems,
  removeOrderItem,
  addOrderService,
  getOrderServices,
  removeOrderService,
  addDesignUpload,
  getDesignUploads,
  removeDesignUpload,
  getStockMovements,
} from "./db";
import { storagePut, storageGet } from "./storage";

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // PRODUCTS ROUTER
  // ============================================================================

  products: router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, "Nome é obrigatório"),
          description: z.string().optional(),
          basePrice: z.number().int().positive("Preço deve ser positivo"),
          sku: z.string().min(1, "SKU é obrigatório"),
          category: z.string().optional(),
          initialStock: z.number().int().nonnegative().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = `prod_${generateId()}`;

        const product = await createProduct({
          id,
          name: input.name,
          description: input.description,
          basePrice: input.basePrice,
          sku: input.sku,
          category: input.category,
        });

        // Initialize stock if provided
        if (input.initialStock !== undefined) {
          await initializeStock(id, input.initialStock);
        }

        return product;
      }),

    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const product = await getProduct(input.id);
        if (!product) throw new Error("Produto não encontrado");

        const stock = await getStock(input.id);

        return {
          ...product,
          stock: stock?.quantity || 0,
        };
      }),

    getBySku: publicProcedure
      .input(z.object({ sku: z.string() }))
      .query(async ({ input }) => {
        const product = await getProductBySku(input.sku);
        if (!product) throw new Error("Produto não encontrado");

        const stock = await getStock(product.id);

        return {
          ...product,
          stock: stock?.quantity || 0,
        };
      }),

    list: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .query(async ({ input }) => {
        const products = await listProducts({
          category: input.category,
          isActive: input.isActive,
        });

        const productsWithStock = await Promise.all(
          products.map(async (product) => {
            const stock = await getStock(product.id);
            return {
              ...product,
              stock: stock?.quantity || 0,
            };
          })
        );

        return productsWithStock;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          description: z.string().optional(),
          basePrice: z.number().int().positive().optional(),
          category: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const product = await updateProduct(id, data);
        if (!product) throw new Error("Produto não encontrado");

        const stock = await getStock(id);
        return {
          ...product,
          stock: stock?.quantity || 0,
        };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const success = await deleteProduct(input.id);
        if (!success) throw new Error("Falha ao deletar produto");
        return { success: true };
      }),
  }),

  // ============================================================================
  // STOCK ROUTER
  // ============================================================================

  stock: router({
    get: publicProcedure
      .input(z.object({ productId: z.string() }))
      .query(async ({ input }) => {
        const stock = await getStock(input.productId);
        if (!stock) throw new Error("Estoque não encontrado");
        return stock;
      }),

    update: protectedProcedure
      .input(
        z.object({
          productId: z.string(),
          quantity: z.number().int().nonnegative(),
        })
      )
      .mutation(async ({ input }) => {
        const stock = await updateStockQuantity(input.productId, input.quantity);
        if (!stock) throw new Error("Falha ao atualizar estoque");
        return stock;
      }),

    decrease: protectedProcedure
      .input(
        z.object({
          productId: z.string(),
          quantity: z.number().int().positive(),
          orderId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const success = await decreaseStock(
          input.productId,
          input.quantity,
          input.orderId
        );
        if (!success) throw new Error("Estoque insuficiente");
        return { success: true };
      }),

    increase: protectedProcedure
      .input(
        z.object({
          productId: z.string(),
          quantity: z.number().int().positive(),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const success = await increaseStock(
          input.productId,
          input.quantity,
          input.reason
        );
        if (!success) throw new Error("Falha ao aumentar estoque");
        return { success: true };
      }),

    movements: publicProcedure
      .input(
        z.object({
          productId: z.string().optional(),
          orderId: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return getStockMovements(input.productId, input.orderId);
      }),
  }),

  // ============================================================================
  // ORDERS ROUTER
  // ============================================================================

  orders: router({
    create: protectedProcedure
      .input(
        z.object({
          customerName: z.string().min(1, "Nome do cliente é obrigatório"),
          customerEmail: z.string().email().optional(),
          customerPhone: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const id = `order_${generateId()}`;
        const orderNumber = `ORD-${Date.now()}`;

        const order = await createOrder({
          id,
          orderNumber,
          userId: ctx.user.id,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          subtotal: 0,
          discount: 0,
          discountPercentage: 0,
          notes: input.notes,
        });

        return order;
      }),

    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const order = await getOrder(input.id);
        if (!order) throw new Error("Pedido não encontrado");

        const items = await getOrderItems(input.id);
        const services = await getOrderServices(input.id);
        const designs = await getDesignUploads(input.id);

        return {
          ...order,
          items,
          services,
          designs,
        };
      }),

    getByNumber: publicProcedure
      .input(z.object({ orderNumber: z.string() }))
      .query(async ({ input }) => {
        const order = await getOrderByNumber(input.orderNumber);
        if (!order) throw new Error("Pedido não encontrado");

        const items = await getOrderItems(order.id);
        const services = await getOrderServices(order.id);
        const designs = await getDesignUploads(order.id);

        return {
          ...order,
          items,
          services,
          designs,
        };
      }),

    list: protectedProcedure
      .input(
        z.object({
          userId: z.string().optional(),
          status: z.string().optional(),
          limit: z.number().int().positive().default(20),
          offset: z.number().int().nonnegative().default(0),
        })
      )
      .query(async ({ input, ctx }) => {
        const orders = await listOrders({
          userId: input.userId || ctx.user.id,
          status: input.status,
          limit: input.limit,
          offset: input.offset,
        });

        const ordersWithDetails = await Promise.all(
          orders.map(async (order) => {
            const items = await getOrderItems(order.id);
            const services = await getOrderServices(order.id);
            return {
              ...order,
              items,
              services,
              itemCount: items.length,
              serviceCount: services.length,
            };
          })
        );

        return ordersWithDetails;
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          status: z.enum([
            "pending",
            "processing",
            "ready",
            "shipped",
            "delivered",
            "cancelled",
          ]),
        })
      )
      .mutation(async ({ input }) => {
        const order = await updateOrderStatus(input.id, input.status);
        if (!order) throw new Error("Pedido não encontrado");
        return order;
      }),

    updateTotal: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          subtotal: z.number().int().nonnegative(),
          discount: z.number().int().nonnegative().default(0),
          discountPercentage: z.number().int().min(0).max(100).default(0),
        })
      )
      .mutation(async ({ input }) => {
        const order = await updateOrderTotal(
          input.id,
          input.subtotal,
          input.discount,
          input.discountPercentage
        );
        if (!order) throw new Error("Pedido não encontrado");
        return order;
      }),
  }),

  // ============================================================================
  // ORDER ITEMS ROUTER
  // ============================================================================

  orderItems: router({
    add: protectedProcedure
      .input(
        z.object({
          orderId: z.string(),
          productId: z.string(),
          quantity: z.number().int().positive(),
          unitPrice: z.number().int().positive(),
        })
      )
      .mutation(async ({ input }) => {
        const id = `item_${generateId()}`;

        const item = await addOrderItem({
          id,
          orderId: input.orderId,
          productId: input.productId,
          quantity: input.quantity,
          unitPrice: input.unitPrice,
        });

        // Update order total
        const order = await getOrder(input.orderId);
        if (order) {
          const items = await getOrderItems(input.orderId);
          const services = await getOrderServices(input.orderId);

          const itemsTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
          const servicesTotal = services.reduce((sum, svc) => sum + svc.price, 0);
          const subtotal = itemsTotal + servicesTotal;

          await updateOrderTotal(
            input.orderId,
            subtotal,
            order.discount,
            order.discountPercentage
          );
        }

        return item;
      }),

    get: publicProcedure
      .input(z.object({ orderId: z.string() }))
      .query(async ({ input }) => {
        return getOrderItems(input.orderId);
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.string(), orderId: z.string() }))
      .mutation(async ({ input }) => {
        const success = await removeOrderItem(input.id);
        if (!success) throw new Error("Falha ao remover item");

        // Update order total
        const order = await getOrder(input.orderId);
        if (order) {
          const items = await getOrderItems(input.orderId);
          const services = await getOrderServices(input.orderId);

          const itemsTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
          const servicesTotal = services.reduce((sum, svc) => sum + svc.price, 0);
          const subtotal = itemsTotal + servicesTotal;

          await updateOrderTotal(
            input.orderId,
            subtotal,
            order.discount,
            order.discountPercentage
          );
        }

        return { success: true };
      }),
  }),

  // ============================================================================
  // ORDER SERVICES ROUTER
  // ============================================================================

  orderServices: router({
    add: protectedProcedure
      .input(
        z.object({
          orderId: z.string(),
          serviceName: z.string().min(1, "Nome do serviço é obrigatório"),
          description: z.string().optional(),
          price: z.number().int().nonnegative(),
        })
      )
      .mutation(async ({ input }) => {
        const id = `svc_${generateId()}`;

        const service = await addOrderService({
          id,
          orderId: input.orderId,
          serviceName: input.serviceName,
          description: input.description,
          price: input.price,
        });

        // Update order total
        const order = await getOrder(input.orderId);
        if (order) {
          const items = await getOrderItems(input.orderId);
          const services = await getOrderServices(input.orderId);

          const itemsTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
          const servicesTotal = services.reduce((sum, svc) => sum + svc.price, 0);
          const subtotal = itemsTotal + servicesTotal;

          await updateOrderTotal(
            input.orderId,
            subtotal,
            order.discount,
            order.discountPercentage
          );
        }

        return service;
      }),

    get: publicProcedure
      .input(z.object({ orderId: z.string() }))
      .query(async ({ input }) => {
        return getOrderServices(input.orderId);
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.string(), orderId: z.string() }))
      .mutation(async ({ input }) => {
        const success = await removeOrderService(input.id);
        if (!success) throw new Error("Falha ao remover serviço");

        // Update order total
        const order = await getOrder(input.orderId);
        if (order) {
          const items = await getOrderItems(input.orderId);
          const services = await getOrderServices(input.orderId);

          const itemsTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
          const servicesTotal = services.reduce((sum, svc) => sum + svc.price, 0);
          const subtotal = itemsTotal + servicesTotal;

          await updateOrderTotal(
            input.orderId,
            subtotal,
            order.discount,
            order.discountPercentage
          );
        }

        return { success: true };
      }),
  }),

  // ============================================================================
  // DESIGN UPLOADS ROUTER
  // ============================================================================

  designs: router({
    upload: protectedProcedure
      .input(
        z.object({
          orderId: z.string(),
          fileName: z.string().min(1, "Nome do arquivo é obrigatório"),
          fileData: z.instanceof(Buffer),
          mimeType: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = `design_${generateId()}`;
        const key = `designs/${input.orderId}/${id}/${input.fileName}`;

        const { url } = await storagePut(key, input.fileData, input.mimeType);

        const design = await addDesignUpload({
          id,
          orderId: input.orderId,
          fileName: input.fileName,
          fileUrl: url,
          fileSize: input.fileData.length,
          mimeType: input.mimeType,
        });

        return design;
      }),

    get: publicProcedure
      .input(z.object({ orderId: z.string() }))
      .query(async ({ input }) => {
        return getDesignUploads(input.orderId);
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const success = await removeDesignUpload(input.id);
        if (!success) throw new Error("Falha ao remover design");
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;


import { Router, Response } from "express";
import { body } from "express-validator";
import prisma from "../utils/prisma.js";
import { AuthRequest, requireAuth, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === "admin";

  const orders = await prisma.order.findMany({
    where: isAdmin ? {} : { userId: req.user!.userId },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, image: true } },
        },
      },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: orders });
});

router.get("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const orderId = parseInt(id, 10);

  if (!orderId) {
    throw new AppError("Invalid order ID", 400);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, image: true } },
        },
      },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (req.user!.role !== "admin" && order.userId !== req.user!.userId) {
    throw new AppError("Unauthorized", 403);
  }

  res.json({ success: true, data: order });
});

router.post(
  "/",
  requireAuth,
  [
    body("shippingAddress").trim().notEmpty().withMessage("Shipping address is required"),
  ],
  validate,
  async (req: AuthRequest, res: Response) => {
    const { shippingAddress } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
      }
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user!.userId,
          total,
          shippingAddress,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true, image: true } },
            },
          },
        },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    res.status(201).json({ success: true, data: order });
  }
);

router.put(
  "/:id/status",
  requireAdmin,
  [
    body("status").isIn(["pending", "processing", "shipped", "delivered", "cancelled"]).withMessage("Invalid status"),
    body("paymentStatus").optional().isIn(["pending", "paid", "failed", "refunded"]).withMessage("Invalid payment status"),
  ],
  validate,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const orderId = parseInt(id, 10);

    if (!orderId) {
      throw new AppError("Invalid order ID", 400);
    }

    const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existingOrder) {
      throw new AppError("Order not found", 404);
    }

    const { status, paymentStatus } = req.body;

    const updateData: Record<string, any> = {};
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, image: true } },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ success: true, data: order });
  }
);

export default router;

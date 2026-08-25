import { Router, Request, Response } from "express";
import { body } from "express-validator";
import prisma from "../utils/prisma.js";
import { AuthRequest, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user!.userId },
    include: {
      items: {
        include: {
          product: {
            include: { category: { select: { id: true, name: true, slug: true } } },
          },
        },
      },
    },
  });

  if (!cart) {
    return res.json({ success: true, data: { id: 0, items: [] } });
  }

  res.json({ success: true, data: cart });
});

router.post(
  "/",
  requireAuth,
  [
    body("productId").isInt({ min: 1 }).withMessage("Valid product ID is required"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  ],
  validate,
  async (req: AuthRequest, res: Response) => {
    const { productId, quantity } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (product.stock < quantity) {
      throw new AppError("Insufficient stock", 400);
    }

    let cart = await prisma.cart.findUnique({ where: { userId: req.user!.userId } });

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user!.userId } });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new AppError("Insufficient stock", 400);
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: { category: { select: { id: true, name: true, slug: true } } },
            },
          },
        },
      },
    });

    res.status(201).json({ success: true, data: updatedCart });
  }
);

router.put(
  "/:id",
  requireAuth,
  [
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  ],
  validate,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const cartItemId = parseInt(id, 10);
    const { quantity } = req.body;

    if (!cartItemId) {
      throw new AppError("Invalid cart item ID", 400);
    }

    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.userId } });
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id },
      include: { product: true },
    });

    if (!cartItem) {
      throw new AppError("Cart item not found", 404);
    }

    if (quantity > cartItem.product.stock) {
      throw new AppError("Insufficient stock", 400);
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: { category: { select: { id: true, name: true, slug: true } } },
            },
          },
        },
      },
    });

    res.json({ success: true, data: updatedCart });
  }
);

router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const cartItemId = parseInt(id, 10);

  if (!cartItemId) {
    throw new AppError("Invalid cart item ID", 400);
  }

  const cart = await prisma.cart.findUnique({ where: { userId: req.user!.userId } });
  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  const cartItem = await prisma.cartItem.findFirst({
    where: { id: cartItemId, cartId: cart.id },
  });

  if (!cartItem) {
    throw new AppError("Cart item not found", 404);
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } });

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: {
            include: { category: { select: { id: true, name: true, slug: true } } },
          },
        },
      },
    },
  });

  res.json({ success: true, data: updatedCart });
});

router.delete("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user!.userId } });

  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  res.json({ success: true, data: { id: 0, items: [] } });
});

export default router;

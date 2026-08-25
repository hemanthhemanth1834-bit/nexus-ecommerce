import { Router, Response } from "express";
import { body } from "express-validator";
import prisma from "../utils/prisma.js";
import { AuthRequest, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: req.user!.userId },
    include: {
      product: {
        include: { category: { select: { id: true, name: true, slug: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: wishlistItems });
});

router.post(
  "/",
  requireAuth,
  [
    body("productId").isInt({ min: 1 }).withMessage("Valid product ID is required"),
  ],
  validate,
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const existingItem = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: req.user!.userId, productId } },
    });

    if (existingItem) {
      throw new AppError("Product already in wishlist", 409);
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: req.user!.userId,
        productId,
      },
      include: {
        product: {
          include: { category: { select: { id: true, name: true, slug: true } } },
        },
      },
    });

    res.status(201).json({ success: true, data: wishlistItem });
  }
);

router.delete("/:productId", requireAuth, async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const pid = parseInt(productId, 10);

  if (!pid) {
    throw new AppError("Invalid product ID", 400);
  }

  const existingItem = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: req.user!.userId, productId: pid } },
  });

  if (!existingItem) {
    throw new AppError("Item not found in wishlist", 404);
  }

  await prisma.wishlistItem.delete({
    where: { userId_productId: { userId: req.user!.userId, productId: pid } },
  });

  res.json({ success: true, message: "Item removed from wishlist" });
});

export default router;

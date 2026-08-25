import { Router, Request, Response } from "express";
import { body } from "express-validator";
import prisma from "../utils/prisma.js";
import { AuthRequest, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/product/:productId", async (req: Request, res: Response) => {
  const { productId } = req.params;
  const pid = parseInt(productId, 10);

  if (!pid) {
    throw new AppError("Invalid product ID", 400);
  }

  const reviews = await prisma.review.findMany({
    where: { productId: pid },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: reviews });
});

router.post(
  "/",
  requireAuth,
  [
    body("productId").isInt({ min: 1 }).withMessage("Valid product ID is required"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").trim().notEmpty().withMessage("Comment is required"),
  ],
  validate,
  async (req: AuthRequest, res: Response) => {
    const { productId, rating, comment } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const existingReview = await prisma.review.findUnique({
      where: { userId_productId: { userId: req.user!.userId, productId } },
    });

    if (existingReview) {
      throw new AppError("You have already reviewed this product", 409);
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user!.userId,
        productId,
        rating,
        comment,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    const stats = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: stats._avg.rating || 0,
        reviewCount: stats._count.rating,
      },
    });

    res.status(201).json({ success: true, data: review });
  }
);

router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const reviewId = parseInt(id, 10);

  if (!reviewId) {
    throw new AppError("Invalid review ID", 400);
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  if (review.userId !== req.user!.userId) {
    throw new AppError("Unauthorized", 403);
  }

  await prisma.review.delete({ where: { id: reviewId } });

  const stats = await prisma.review.aggregate({
    where: { productId: review.productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: review.productId },
    data: {
      rating: stats._avg.rating || 0,
      reviewCount: stats._count.rating,
    },
  });

  res.json({ success: true, message: "Review deleted successfully" });
});

export default router;

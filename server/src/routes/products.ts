import { Router, Request, Response } from "express";
import { body, query } from "express-validator";
import prisma from "../utils/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    minRating,
    sort,
    page = "1",
    limit = "12",
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  if (minRating) {
    where.rating = { gte: parseFloat(minRating) };
  }

  let orderBy: any = { createdAt: "desc" };
  switch (sort) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "rating":
      orderBy = { rating: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limitNum,
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

router.get("/featured", async (req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    where: { featured: true },
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  res.json({ success: true, data: products });
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id: parseInt(id, 10) || 0 }, { slug: id }],
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      reviews: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.json({ success: true, data: product });
});

router.post(
  "/",
  requireAdmin,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("slug").trim().notEmpty().withMessage("Slug is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
    body("image").trim().notEmpty().withMessage("Image is required"),
    body("categoryId").isInt({ min: 1 }).withMessage("Valid category is required"),
  ],
  validate,
  async (req: Request, res: Response) => {
    const { name, slug, description, price, compareAtPrice, image, images, categoryId, stock, featured, specifications } = req.body;

    const existingCategory = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existingCategory) {
      throw new AppError("Category not found", 404);
    }

    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      throw new AppError("Product slug already exists", 409);
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        compareAtPrice: compareAtPrice || null,
        image,
        images: JSON.stringify(images || []),
        categoryId,
        stock: stock || 0,
        featured: featured || false,
        specifications: JSON.stringify(specifications || {}),
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    res.status(201).json({ success: true, data: product });
  }
);

router.put(
  "/:id",
  requireAdmin,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("price").optional().isFloat({ min: 0 }).withMessage("Valid price is required"),
  ],
  validate,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const productId = parseInt(id, 10);

    if (!productId) {
      throw new AppError("Invalid product ID", 400);
    }

    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
      throw new AppError("Product not found", 404);
    }

    const { name, slug, description, price, compareAtPrice, image, images, categoryId, stock, featured, specifications } = req.body;

    if (slug && slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findFirst({
        where: { slug, NOT: { id: productId } },
      });
      if (slugExists) {
        throw new AppError("Product slug already exists", 409);
      }
    }

    if (categoryId) {
      const existingCategory = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!existingCategory) {
        throw new AppError("Category not found", 404);
      }
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (compareAtPrice !== undefined) updateData.compareAtPrice = compareAtPrice;
    if (image !== undefined) updateData.image = image;
    if (images !== undefined) updateData.images = JSON.stringify(images);
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (stock !== undefined) updateData.stock = stock;
    if (featured !== undefined) updateData.featured = featured;
    if (specifications !== undefined) updateData.specifications = JSON.stringify(specifications);

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    res.json({ success: true, data: product });
  }
);

router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const productId = parseInt(id, 10);

  if (!productId) {
    throw new AppError("Invalid product ID", 400);
  }

  const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  await prisma.product.delete({ where: { id: productId } });

  res.json({ success: true, message: "Product deleted successfully" });
});

export default router;

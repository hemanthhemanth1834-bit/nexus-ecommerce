import { Router, Request, Response } from "express";
import { body } from "express-validator";
import prisma from "../utils/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  res.json({ success: true, data: categories });
});

router.get("/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
        include: { category: { select: { id: true, name: true, slug: true } } },
      },
      _count: { select: { products: true } },
    },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  res.json({ success: true, data: category });
});

router.post(
  "/",
  requireAdmin,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("slug").trim().notEmpty().withMessage("Slug is required"),
  ],
  validate,
  async (req: Request, res: Response) => {
    const { name, slug, description, image } = req.body;

    const existingSlug = await prisma.category.findUnique({ where: { slug } });
    if (existingSlug) {
      throw new AppError("Category slug already exists", 409);
    }

    const category = await prisma.category.create({
      data: { name, slug, description, image },
      include: { _count: { select: { products: true } } },
    });

    res.status(201).json({ success: true, data: category });
  }
);

router.put(
  "/:id",
  requireAdmin,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("slug").optional().trim().notEmpty().withMessage("Slug cannot be empty"),
  ],
  validate,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const categoryId = parseInt(id, 10);

    if (!categoryId) {
      throw new AppError("Invalid category ID", 400);
    }

    const existingCategory = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existingCategory) {
      throw new AppError("Category not found", 404);
    }

    const { name, slug, description, image } = req.body;

    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findFirst({
        where: { slug, NOT: { id: categoryId } },
      });
      if (slugExists) {
        throw new AppError("Category slug already exists", 409);
      }
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
      include: { _count: { select: { products: true } } },
    });

    res.json({ success: true, data: category });
  }
);

router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const categoryId = parseInt(id, 10);

  if (!categoryId) {
    throw new AppError("Invalid category ID", 400);
  }

  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { products: true } } },
  });

  if (!existingCategory) {
    throw new AppError("Category not found", 404);
  }

  if (existingCategory._count.products > 0) {
    throw new AppError("Cannot delete category with existing products", 400);
  }

  await prisma.category.delete({ where: { id: categoryId } });

  res.json({ success: true, message: "Category deleted successfully" });
});

export default router;

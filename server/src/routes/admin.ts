import { Router, Response } from "express";
import prisma from "../utils/prisma.js";
import { AuthRequest, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/stats", requireAdmin, async (req: AuthRequest, res: Response) => {
  const [
    totalProducts,
    totalUsers,
    totalOrders,
    pendingOrders,
    totalSales,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid" } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    }),
  ]);

  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lte: 5 } },
    take: 10,
    orderBy: { stock: "asc" },
  });

  res.json({
    success: true,
    data: {
      totalProducts,
      totalUsers,
      totalOrders,
      pendingOrders,
      totalSales: totalSales._sum.total || 0,
      recentOrders,
      lowStockProducts,
    },
  });
});

router.get("/users", requireAdmin, async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { orders: true, reviews: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: users });
});

export default router;

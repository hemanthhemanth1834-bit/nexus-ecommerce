import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("admin123", 12);
  const userPassword = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      role: "admin",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      password: userPassword,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "jane@example.com",
      password: userPassword,
    },
  });

  console.log("Created users:", { admin: admin.email, user1: user1.email, user2: user2.email });

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Electronics",
        slug: "electronics",
        description: "Latest electronic gadgets and devices",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
      },
    }),
    prisma.category.create({
      data: {
        name: "Clothing",
        slug: "clothing",
        description: "Fashion and apparel for all occasions",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
      },
    }),
    prisma.category.create({
      data: {
        name: "Home & Garden",
        slug: "home-garden",
        description: "Furniture, decor, and garden essentials",
        image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800",
      },
    }),
    prisma.category.create({
      data: {
        name: "Sports & Outdoors",
        slug: "sports-outdoors",
        description: "Equipment and gear for sports and outdoor activities",
        image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800",
      },
    }),
    prisma.category.create({
      data: {
        name: "Books",
        slug: "books",
        description: "Bestselling books and educational materials",
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800",
      },
    }),
  ]);

  console.log("Created categories:", categories.map((c) => c.name));

  const [electronics, clothing, home, sports, books] = categories;

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Wireless Bluetooth Headphones",
        slug: "wireless-bluetooth-headphones",
        description: "Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality. Features comfortable over-ear design with memory foam cushions.",
        price: 199.99,
        compareAtPrice: 249.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
        ]),
        categoryId: electronics.id,
        stock: 50,
        rating: 4.5,
        reviewCount: 120,
        featured: true,
        specifications: JSON.stringify({
          "Battery Life": "30 hours",
          Connectivity: "Bluetooth 5.0",
          Weight: "250g",
          "Noise Cancellation": "Active",
        }),
      },
    }),
    prisma.product.create({
      data: {
        name: "Smart Watch Pro",
        slug: "smart-watch-pro",
        description: "Advanced smartwatch with health monitoring, GPS tracking, and 7-day battery life. Water-resistant up to 50m with AMOLED display.",
        price: 349.99,
        compareAtPrice: 399.99,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        ]),
        categoryId: electronics.id,
        stock: 30,
        rating: 4.7,
        reviewCount: 85,
        featured: true,
        specifications: JSON.stringify({
          Display: "1.4 inch AMOLED",
          Battery: "7 days",
          "Water Resistance": "50m",
          Sensors: "Heart rate, SpO2, GPS",
        }),
      },
    }),
    prisma.product.create({
      data: {
        name: "Portable Bluetooth Speaker",
        slug: "portable-bluetooth-speaker",
        description: "Compact yet powerful portable speaker with 360-degree sound, 20-hour battery life, and waterproof design. Perfect for outdoor adventures.",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
        ]),
        categoryId: electronics.id,
        stock: 100,
        rating: 4.3,
        reviewCount: 200,
        featured: false,
        specifications: JSON.stringify({
          "Battery Life": "20 hours",
          "Water Resistance": "IPX7",
          Weight: "540g",
          Power: "30W",
        }),
      },
    }),
    prisma.product.create({
      data: {
        name: "Classic Denim Jacket",
        slug: "classic-denim-jacket",
        description: "Timeless denim jacket crafted from premium cotton. Features a relaxed fit with button closure, chest pockets, and adjustable waist tabs.",
        price: 89.99,
        compareAtPrice: 120.0,
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800",
        ]),
        categoryId: clothing.id,
        stock: 75,
        rating: 4.4,
        reviewCount: 60,
        featured: true,
        specifications: JSON.stringify({
          Material: "100% Cotton",
          Fit: "Relaxed",
          Care: "Machine wash cold",
          Sizes: "XS, S, M, L, XL, XXL",
        }),
      },
    }),
    prisma.product.create({
      data: {
        name: "Running Sneakers",
        slug: "running-sneakers",
        description: "Lightweight and responsive running shoes with advanced cushioning technology. Breathable mesh upper and durable rubber outsole.",
        price: 129.99,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        ]),
        categoryId: clothing.id,
        stock: 60,
        rating: 4.6,
        reviewCount: 150,
        featured: false,
        specifications: JSON.stringify({
          Material: "Mesh and synthetic",
          Sole: "Rubber",
          Weight: "280g",
          Sizes: "7, 8, 9, 10, 11, 12",
        }),
      },
    }),
    prisma.product.create({
      data: {
        name: "Minimalist Desk Lamp",
        slug: "minimalist-desk-lamp",
        description: "Modern LED desk lamp with adjustable brightness and color temperature. Touch control with wireless charging base and USB port.",
        price: 59.99,
        compareAtPrice: 79.99,
        image: "https://images.unsplash.com/photo-1582356630861-61bb9b41f541?w=800",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1582356630861-61bb9b41f541?w=800",
        ]),
        categoryId: home.id,
        stock: 40,
        rating: 4.2,
        reviewCount: 45,
        featured: false,
        specifications: JSON.stringify({
          "Light Source": "LED",
          Power: "12W",
          "Color Temperature": "3000K-6500K",
          Features: "Touch control, USB port, Wireless charging",
        }),
      },
    }),
    prisma.product.create({
      data: {
        name: "Yoga Mat Premium",
        slug: "yoga-mat-premium",
        description: "Extra thick non-slip yoga mat with alignment lines. Made from eco-friendly TPE material. Includes carrying strap.",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800",
        ]),
        categoryId: sports.id,
        stock: 80,
        rating: 4.8,
        reviewCount: 300,
        featured: true,
        specifications: JSON.stringify({
          Thickness: "6mm",
          Material: "TPE (eco-friendly)",
          Dimensions: "183cm x 61cm",
          Weight: "1.2kg",
        }),
      },
    }),
    prisma.product.create({
      data: {
        name: "Bestselling Novel Collection",
        slug: "bestselling-novel-collection",
        description: "A curated collection of 5 bestselling novels from award-winning authors. Perfect gift for book lovers. Includes titles from various genres.",
        price: 39.99,
        compareAtPrice: 59.99,
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
        ]),
        categoryId: books.id,
        stock: 120,
        rating: 4.9,
        reviewCount: 500,
        featured: false,
        specifications: JSON.stringify({
          "Number of Books": "5",
          Format: "Paperback",
          Language: "English",
          Genre: "Fiction / Literary",
        }),
      },
    }),
    prisma.product.create({
      data: {
        name: "Stainless Steel Water Bottle",
        slug: "stainless-steel-water-bottle",
        description: "Double-wall vacuum insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and leak-proof design.",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800",
        ]),
        categoryId: sports.id,
        stock: 200,
        rating: 4.5,
        reviewCount: 180,
        featured: false,
        specifications: JSON.stringify({
          Capacity: "750ml",
          Material: "18/8 Stainless Steel",
          Insulation: "Double-wall vacuum",
          Weight: "350g",
        }),
      },
    }),
    prisma.product.create({
      data: {
        name: "Ergonomic Office Chair",
        slug: "ergonomic-office-chair",
        description: "Fully adjustable ergonomic office chair with lumbar support, breathable mesh back, and padded armrests. Supports up to 150kg.",
        price: 299.99,
        compareAtPrice: 399.99,
        image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800",
        ]),
        categoryId: home.id,
        stock: 25,
        rating: 4.6,
        reviewCount: 90,
        featured: true,
        specifications: JSON.stringify({
          Material: "Mesh and steel",
          "Max Weight": "150kg",
          Adjustability: "Height, armrests, lumbar, tilt",
          "Seat Height": "45-55cm",
        }),
      },
    }),
    prisma.product.create({
      data: {
        name: "Wireless Charging Pad",
        slug: "wireless-charging-pad",
        description: "Slim Qi-compatible wireless charger with 15W fast charging. LED indicator and foreign object detection for safety.",
        price: 24.99,
        compareAtPrice: 34.99,
        image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800",
        ]),
        categoryId: electronics.id,
        stock: 150,
        rating: 4.1,
        reviewCount: 75,
        featured: false,
        specifications: JSON.stringify({
          Power: "15W max",
          Compatibility: "Qi-enabled devices",
          Input: "USB-C",
          Weight: "85g",
        }),
      },
    }),
    prisma.product.create({
      data: {
        name: "Leather Crossbody Bag",
        slug: "leather-crossbody-bag",
        description: "Handcrafted genuine leather crossbody bag with adjustable strap. Multiple compartments for organized storage.",
        price: 149.99,
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
        ]),
        categoryId: clothing.id,
        stock: 35,
        rating: 4.7,
        reviewCount: 40,
        featured: false,
        specifications: JSON.stringify({
          Material: "Genuine leather",
          Dimensions: "25cm x 18cm x 8cm",
          Compartments: "3",
          Strap: "Adjustable, 120cm",
        }),
      },
    }),
  ]);

  console.log("Created products:", products.length);

  const cart1 = await prisma.cart.create({
    data: { userId: user1.id },
  });

  await prisma.cartItem.createMany({
    data: [
      { cartId: cart1.id, productId: products[0].id, quantity: 1 },
      { cartId: cart1.id, productId: products[4].id, quantity: 2 },
    ],
  });

  console.log("Created cart for user1");

  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      total: 199.99,
      status: "delivered",
      paymentStatus: "paid",
      shippingAddress: "123 Main St, Springfield, IL 62701, USA",
      items: {
        create: [{ productId: products[0].id, quantity: 1, price: 199.99 }],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: user2.id,
      total: 139.98,
      status: "processing",
      paymentStatus: "paid",
      shippingAddress: "456 Oak Ave, Portland, OR 97201, USA",
      items: {
        create: [
          { productId: products[3].id, quantity: 1, price: 89.99 },
          { productId: products[5].id, quantity: 1, price: 49.99 },
        ],
      },
    },
  });

  console.log("Created orders");

  await prisma.review.createMany({
    data: [
      { userId: user1.id, productId: products[0].id, rating: 5, comment: "Amazing sound quality! The noise cancellation is top-notch." },
      { userId: user2.id, productId: products[0].id, rating: 4, comment: "Great headphones, very comfortable for long sessions." },
      { userId: user1.id, productId: products[1].id, rating: 5, comment: "Best smartwatch I've ever owned. Battery lasts forever!" },
      { userId: user2.id, productId: products[6].id, rating: 5, comment: "Perfect for my yoga practice. Very comfortable and non-slip." },
      { userId: user1.id, productId: products[9].id, rating: 4, comment: "Very comfortable chair, helped with my back pain." },
    ],
  });

  console.log("Created reviews");

  await prisma.wishlistItem.createMany({
    data: [
      { userId: user1.id, productId: products[1].id },
      { userId: user1.id, productId: products[6].id },
      { userId: user2.id, productId: products[0].id },
      { userId: user2.id, productId: products[9].id },
    ],
  });

  console.log("Created wishlist items");

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

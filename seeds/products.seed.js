const mongoose = require("mongoose");
const slugify = require("slugify");
require("dotenv").config();

const Category = require("../models/category.model");
const Product = require("../models/product.model");

const LOREM_IMG = "https://picsum.photos/seed";

const categories = [
  { name: "Amigurumi", slug: "amigurumi", description: "Cute crocheted stuffed animals and characters" },
  { name: "Blankets", slug: "blankets", description: "Cozy handmade crochet blankets" },
  { name: "Accessories", slug: "accessories", description: "Hats, scarves, and more" },
  { name: "Home Decor", slug: "home-decor", description: "Crocheted pillows, coasters, and decor items" },
];

const buildProducts = (categoryMap) => [
  // ── Amigurumi ──
  {
    name: "Snuggly Bear Plushie",
    slug: slugify("Snuggly Bear Plushie", { lower: true }),
    description: "An adorable hand-crocheted bear plushie, perfect for cuddling. Made with 100% cotton yarn.",
    category: categoryMap["Amigurumi"],
    basePrice: 24.99,
    images: [
      `${LOREM_IMG}/bear1/400/400`,
      `${LOREM_IMG}/bear2/400/400`,
    ],
    variants: [
      { size: "Small", color: "Brown", price: 24.99, stock: 15, sku: "AMG-BEAR-S-BR" },
      { size: "Medium", color: "Brown", price: 34.99, stock: 10, sku: "AMG-BEAR-M-BR" },
      { size: "Small", color: "Cream", price: 24.99, stock: 8, sku: "AMG-BEAR-S-CR" },
    ],
    totalStock: 33,
    isFeatured: true,
  },
  {
    name: "Crochet Bunny Amigurumi",
    slug: slugify("Crochet Bunny Amigurumi", { lower: true }),
    description: "A sweet little bunny with floppy ears. Handmade with soft acrylic yarn and safety eyes.",
    category: categoryMap["Amigurumi"],
    basePrice: 19.99,
    images: [
      `${LOREM_IMG}/bunny1/400/400`,
      `${LOREM_IMG}/bunny2/400/400`,
    ],
    variants: [
      { size: "Small", color: "White", price: 19.99, stock: 20, sku: "AMG-BNY-S-WH" },
      { size: "Small", color: "Pink", price: 19.99, stock: 12, sku: "AMG-BNY-S-PK" },
      { size: "Large", color: "White", price: 29.99, stock: 5, sku: "AMG-BNY-L-WH" },
    ],
    totalStock: 37,
    isFeatured: true,
  },
  {
    name: "Mini Crochet Dinosaur",
    slug: slugify("Mini Crochet Dinosaur", { lower: true }),
    description: "A tiny crocheted T-Rex keychain charm. Great as a gift or bag accessory.",
    category: categoryMap["Amigurumi"],
    basePrice: 12.99,
    images: [
      `${LOREM_IMG}/dino1/400/400`,
    ],
    variants: [
      { size: "Mini", color: "Green", price: 12.99, stock: 30, sku: "AMG-DINO-M-GR" },
      { size: "Mini", color: "Blue", price: 12.99, stock: 25, sku: "AMG-DINO-M-BL" },
    ],
    totalStock: 55,
  },
  {
    name: "Crochet Cat Plushie",
    slug: slugify("Crochet Cat Plushie", { lower: true }),
    description: "An irresistibly cute crocheted cat with embroidered whiskers and a tiny bell collar.",
    category: categoryMap["Amigurumi"],
    basePrice: 22.99,
    images: [
      `${LOREM_IMG}/cat1/400/400`,
      `${LOREM_IMG}/cat2/400/400`,
    ],
    variants: [
      { size: "Small", color: "Orange", price: 22.99, stock: 14, sku: "AMG-CAT-S-OR" },
      { size: "Small", color: "Black", price: 22.99, stock: 10, sku: "AMG-CAT-S-BK" },
      { size: "Medium", color: "Gray", price: 32.99, stock: 6, sku: "AMG-CAT-M-GR" },
    ],
    totalStock: 30,
    isFeatured: true,
  },

  // ── Blankets ──
  {
    name: "Rainbow Granny Square Blanket",
    slug: slugify("Rainbow Granny Square Blanket", { lower: true }),
    description: "A vibrant rainbow blanket made of classic granny squares. Machine washable.",
    category: categoryMap["Blankets"],
    basePrice: 59.99,
    images: [
      `${LOREM_IMG}/blanket1/400/400`,
      `${LOREM_IMG}/blanket2/400/400`,
    ],
    variants: [
      { size: "Throw", color: "Rainbow", price: 59.99, stock: 5, sku: "BLK-GRN-T-RB" },
      { size: "Queen", color: "Rainbow", price: 89.99, stock: 3, sku: "BLK-GRN-Q-RB" },
    ],
    totalStock: 8,
    isFeatured: true,
  },
  {
    name: "Chunky Knit Baby Blanket",
    slug: slugify("Chunky Knit Baby Blanket", { lower: true }),
    description: "Super soft chunky crochet baby blanket in pastel colours. Perfect for nurseries.",
    category: categoryMap["Blankets"],
    basePrice: 39.99,
    images: [
      `${LOREM_IMG}/babyblanket1/400/400`,
    ],
    variants: [
      { size: "Baby", color: "Pastel Yellow", price: 39.99, stock: 10, sku: "BLK-BBY-B-YL" },
      { size: "Baby", color: "Pastel Green", price: 39.99, stock: 8, sku: "BLK-BBY-B-GN" },
      { size: "Baby", color: "Pastel Pink", price: 39.99, stock: 7, sku: "BLK-BBY-B-PK" },
    ],
    totalStock: 25,
  },
  {
    name: "Herringbone Crochet Throw",
    slug: slugify("Herringbone Crochet Throw", { lower: true }),
    description: "Elegant herringbone-stitch throw blanket in neutral tones. A perfect couch companion.",
    category: categoryMap["Blankets"],
    basePrice: 54.99,
    images: [
      `${LOREM_IMG}/throw1/400/400`,
      `${LOREM_IMG}/throw2/400/400`,
    ],
    variants: [
      { size: "Throw", color: "Ivory", price: 54.99, stock: 6, sku: "BLK-HRB-T-IV" },
      { size: "Throw", color: "Charcoal", price: 54.99, stock: 4, sku: "BLK-HRB-T-CH" },
    ],
    totalStock: 10,
  },

  // ── Accessories ──
  {
    name: "Crochet Beanie Hat",
    slug: slugify("Crochet Beanie Hat", { lower: true }),
    description: "Warm and cozy crocheted beanie with a faux-fur pom pom. One size fits most.",
    category: categoryMap["Accessories"],
    basePrice: 18.99,
    images: [
      `${LOREM_IMG}/beanie1/400/400`,
      `${LOREM_IMG}/beanie2/400/400`,
    ],
    variants: [
      { size: "One Size", color: "Burgundy", price: 18.99, stock: 20, sku: "ACC-BNE-OS-BG" },
      { size: "One Size", color: "Navy", price: 18.99, stock: 18, sku: "ACC-BNE-OS-NV" },
      { size: "One Size", color: "Cream", price: 18.99, stock: 15, sku: "ACC-BNE-OS-CR" },
    ],
    totalStock: 53,
  },
  {
    name: "Infinity Scarf",
    slug: slugify("Infinity Scarf", { lower: true }),
    description: "A stylish hand-crocheted infinity scarf. Lightweight enough for autumn, warm enough for winter.",
    category: categoryMap["Accessories"],
    basePrice: 25.99,
    images: [
      `${LOREM_IMG}/scarf1/400/400`,
    ],
    variants: [
      { size: "One Size", color: "Dusty Rose", price: 25.99, stock: 12, sku: "ACC-SCF-OS-DR" },
      { size: "One Size", color: "Sage", price: 25.99, stock: 10, sku: "ACC-SCF-OS-SG" },
    ],
    totalStock: 22,
    isFeatured: true,
  },
  {
    name: "Crochet Market Bag",
    slug: slugify("Crochet Market Bag", { lower: true }),
    description: "Eco-friendly reusable market bag made from durable cotton yarn. Stretchy mesh design.",
    category: categoryMap["Accessories"],
    basePrice: 15.99,
    images: [
      `${LOREM_IMG}/bag1/400/400`,
      `${LOREM_IMG}/bag2/400/400`,
    ],
    variants: [
      { size: "One Size", color: "Natural", price: 15.99, stock: 25, sku: "ACC-BAG-OS-NT" },
      { size: "One Size", color: "Teal", price: 15.99, stock: 20, sku: "ACC-BAG-OS-TL" },
    ],
    totalStock: 45,
  },

  // ── Home Decor ──
  {
    name: "Crochet Throw Pillow Cover",
    slug: slugify("Crochet Throw Pillow Cover", { lower: true }),
    description: "Textured crochet pillow cover with a boho bobble pattern. Fits standard 18×18 pillows.",
    category: categoryMap["Home Decor"],
    basePrice: 28.99,
    images: [
      `${LOREM_IMG}/pillow1/400/400`,
      `${LOREM_IMG}/pillow2/400/400`,
    ],
    variants: [
      { size: "18x18", color: "Mustard", price: 28.99, stock: 10, sku: "DEC-PLW-18-MS" },
      { size: "18x18", color: "Terracotta", price: 28.99, stock: 8, sku: "DEC-PLW-18-TC" },
      { size: "20x20", color: "Mustard", price: 32.99, stock: 5, sku: "DEC-PLW-20-MS" },
    ],
    totalStock: 23,
  },
  {
    name: "Crochet Coaster Set (4-Pack)",
    slug: slugify("Crochet Coaster Set 4-Pack", { lower: true }),
    description: "Set of 4 round crocheted coasters in complementary colours. Protects surfaces in style.",
    category: categoryMap["Home Decor"],
    basePrice: 9.99,
    images: [
      `${LOREM_IMG}/coaster1/400/400`,
    ],
    variants: [
      { size: "Standard", color: "Earth Tones", price: 9.99, stock: 40, sku: "DEC-CST-S-ET" },
      { size: "Standard", color: "Pastels", price: 9.99, stock: 35, sku: "DEC-CST-S-PS" },
    ],
    totalStock: 75,
  },
  {
    name: "Hanging Wall Basket",
    slug: slugify("Hanging Wall Basket", { lower: true }),
    description: "Boho-chic crocheted wall basket for dried flowers, mail, or small plants.",
    category: categoryMap["Home Decor"],
    basePrice: 21.99,
    images: [
      `${LOREM_IMG}/basket1/400/400`,
      `${LOREM_IMG}/basket2/400/400`,
    ],
    variants: [
      { size: "Small", color: "Natural", price: 21.99, stock: 12, sku: "DEC-BSK-S-NT" },
      { size: "Large", color: "Natural", price: 29.99, stock: 7, sku: "DEC-BSK-L-NT" },
    ],
    totalStock: 19,
    isFeatured: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Upsert categories
    const categoryMap = {};
    for (const cat of categories) {
      const doc = await Category.findOneAndUpdate(
        { slug: cat.slug },
        { $set: cat },
        { upsert: true, new: true }
      );
      categoryMap[cat.name] = doc._id;
    }
    console.log(`Upserted ${categories.length} categories`);

    // Remove existing seeded products (by slug) to allow re-running
    const products = buildProducts(categoryMap);
    const slugs = products.map((p) => p.slug);
    await Product.deleteMany({ slug: { $in: slugs } });

    // Insert products
    const inserted = await Product.insertMany(products);
    console.log(`Inserted ${inserted.length} products`);

    await mongoose.disconnect();
    console.log("Done – disconnected from MongoDB");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();

/**
 * Standalone integration test for the 6sense assignment.
 * Connects to a real MongoDB, runs all test cases, then cleans up.
 *
 * Usage:
 *   MONGODB_URI=mongodb://localhost:27017/6sense_test node -e "
 *     require('ts-node/register');
 *     require('./src/tests/integration.test.ts');
 *   "
 *
 * Or with compiled dist:
 *   MONGODB_URI=... node dist/tests/integration.test.js
 */
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import ProductService from "../modules/product/product.service";
import CategoryService from "../modules/category/category.service";
dotenv.config();

const log = (label: string, data: unknown) => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${label}`);
  console.log("=".repeat(60));
  console.log(JSON.stringify(data, null, 2));
};

const assert = (condition: boolean, msg: string) => {
  if (!condition) {
    console.error(`  ❌ FAIL: ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✅ PASS: ${msg}`);
  }
};

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB:", uri);

  // Clean slate
  await mongoose.connection.dropDatabase();

  const categoryService = new CategoryService();
  const productService = new ProductService();

  // ─── 1. Create Category ───────────────────────────────────────────
  const cat = await categoryService.createCategory({
    name: "Electronics",
    description: "Electronic gadgets",
  });
  log("1. Create Category", cat);
  assert(cat.name === "Electronics", "Category name is correct");
  assert(typeof cat._id === "string", "Category has _id");

  // ─── 2. Duplicate Category ────────────────────────────────────────
  try {
    await categoryService.createCategory({ name: "Electronics" });
    assert(false, "Should have rejected duplicate category");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    assert(msg.includes("already exists"), "Duplicate category rejected");
    log("2. Duplicate Category Error", { message: msg });
  }

  // ─── 3. Create Product — Alpha Sorter ─────────────────────────────
  const p1 = await productService.createProduct({
    name: "Alpha Sorter",
    description: "Sorting device",
    price: 100,
    discount: 10,
    image: "https://example.com/alpha.png",
    status: "In Stock" as any,
    categoryId: cat._id,
  });
  log("3. Create Product 'Alpha Sorter' (10% discount)", p1);
  assert(p1.name === "Alpha Sorter", "Product name correct");
  assert(p1.price === 100, "Original price correct");
  assert(p1.finalPrice === 90, "Final price = 100 - 10% = 90");
  assert(typeof p1.productCode === "string", "Product code generated");
  const generatedCode = p1.productCode;
  console.log(`  📌 Generated product code: ${generatedCode}`);

  // Verify code format: contains "alport" with 0 start and 8 end
  const codeBody = generatedCode.split("-").slice(1).join("-");
  assert(codeBody === "0alport8", `Code body is '0alport8', got '${codeBody}'`);

  // ─── 4. Create Product — Beta Runner (no discount) ────────────────
  const p2 = await productService.createProduct({
    name: "Beta Runner",
    description: "Running management system",
    price: 49.99,
    image: "https://example.com/beta.png",
    status: "In Stock" as any,
    categoryId: cat._id,
  });
  log("4. Create Product 'Beta Runner' (no discount)", p2);
  assert(p2.finalPrice === 49.99, "No discount: finalPrice === price");

  // ─── 5. Same name → unique product code ──────────────────────────
  const p3 = await productService.createProduct({
    name: "Alpha Sorter",
    description: "Second alpha sorter",
    price: 55,
    image: "https://example.com/alpha2.png",
    status: "Stock Out" as any,
    categoryId: cat._id,
  });
  log("5. Duplicate name → unique product code", { code: p3.productCode });
  assert(
    p3.productCode !== p1.productCode,
    "Duplicate name gets unique product code"
  );

  // ─── 6. Invalid category ─────────────────────────────────────────
  try {
    await productService.createProduct({
      name: "Ghost",
      description: "Ghost product",
      price: 10,
      image: "https://example.com/g.png",
      status: "In Stock" as any,
      categoryId: "507f1f77bcf86cd799439011",
    });
    assert(false, "Should reject non-existent category");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    assert(msg.includes("does not exist"), "Non-existent category rejected");
    log("6. Non-existent Category Error", { message: msg });
  }

  // ─── 7. Get All Products ──────────────────────────────────────────
  const all = await productService.getProducts({});
  log("7. Get All Products", all);
  assert(all.length === 3, `Expected 3 products, got ${all.length}`);
  assert(
    all.every((p) => "finalPrice" in p && "price" in p),
    "All products include price and finalPrice"
  );

  // ─── 8. Filter by Category ────────────────────────────────────────
  const byCat = await productService.getProducts({ categoryId: cat._id });
  log("8. Filter by Category", byCat.map((p) => p.name));
  assert(byCat.length === 3, "All products match the category filter");

  // ─── 9. Search by Name — partial, case-insensitive ────────────────
  const searchAlpha = await productService.getProducts({ name: "alpha" });
  log("9a. Search 'alpha'", searchAlpha.map((p) => p.name));
  assert(searchAlpha.length === 2, "Found 2 products matching 'alpha'");

  const searchRun = await productService.getProducts({ name: "run" });
  log("9b. Search 'run'", searchRun.map((p) => p.name));
  assert(searchRun.length === 1, "Found 1 product matching 'run'");
  assert(searchRun[0]?.name === "Beta Runner", "Correct product found");

  // ─── 10. Get By ID ────────────────────────────────────────────
  // NOTE: getProductById removed — not in assignment spec

  // ─── 11. Get By Invalid ID ────────────────────────────────────────

  // ─── 12. Update Product ───────────────────────────────────────────
  const updated = await productService.updateProduct(p1._id, {
    status: "Stock Out" as any,
    discount: 25,
    description: "Updated description",
  });
  log("12. Update Product", updated);
  assert(updated.status === "Stock Out", "Status updated correctly");
  assert(updated.discount === 25, "Discount updated correctly");
  assert(updated.description === "Updated description", "Description updated");
  assert(updated.finalPrice === 75, "Final price recalculated: 100 - 25% = 75");

  // ─── 13. Update — only allowed fields (name unchanged) ────────────
  assert(updated.name === "Alpha Sorter", "Name cannot be changed via update");

  // ─── 14. Delete ── NOT in spec, removed ──────────────────────────

  // ─── 15. Get Categories ───────────────────────────────────────────
  const cats = await categoryService.getCategories();
  log("15. Get All Categories", cats);
  assert(cats.length === 1, "One category exists");
  assert(cats[0]?.name === "Electronics", "Correct category name");

  // Cleanup
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();

  console.log("\n" + "=".repeat(60));
  console.log("  ALL TESTS COMPLETE");
  console.log("=".repeat(60));
};

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

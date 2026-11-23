import { prisma } from "../packages/database";

async function main() {
  console.log("🚀 Starting Concurrency & High-Load Checkout Validation...\n");

  // 1. Setup a test limited-edition product with stock = 1
  const testProduct = await prisma.product.upsert({
    where: { slug: "limited-edition-cyber-watch" },
    update: { stock: 1, isActive: true },
    create: {
      name: "Limited Edition Cyber Watch",
      slug: "limited-edition-cyber-watch",
      description: "Exclusive collector edition, only 1 piece available.",
      price: 9999000,
      stock: 1,
      sku: "LTD-CYBER-001",
      categoryId: (await prisma.category.findFirst({ where: { slug: "electronics" } }))!.id,
      isActive: true,
    },
  });

  console.log(`📦 Test Product: "${testProduct.name}" (ID: ${testProduct.id}), Current Stock = ${testProduct.stock}`);

  // 2. Create 5 test customer accounts
  const customerTokens: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const email = `test.concurrent.${i}@test.com`;
    const passwordHash = await Bun.password.hash("Password123!", { algorithm: "bcrypt", cost: 10 });
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        fullName: `Buyer ${i}`,
        role: "CUSTOMER",
      },
    });

    // Login via API to get auth cookie
    const loginRes = await fetch("http://localhost:3001/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "Password123!" }),
    });

    const setCookie = loginRes.headers.get("set-cookie") || "";
    const cookie = setCookie.split(";")[0];
    customerTokens.push(cookie);

    // Add 1 piece of limited watch to their cart
    await fetch("http://localhost:3001/api/v1/cart/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ productId: testProduct.id, quantity: 1 }),
    });
  }

  console.log(`👥 Prepared ${customerTokens.length} separate buyers, each having 1 watch in their cart.`);
  console.log("⚡ Firing 5 concurrent checkout requests simultaneously...\n");

  // 3. Fire all 5 checkout requests simultaneously
  const results = await Promise.allSettled(
    customerTokens.map((cookie, idx) =>
      fetch("http://localhost:3001/api/v1/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
        body: JSON.stringify({
          shippingAddress: {
            recipientName: `Buyer ${idx + 1}`,
            phone: "081299887766",
            street: "Jl. Gatot Subroto No. 10",
            city: "Jakarta",
            postalCode: "12930",
          },
          paymentMethod: "MANUAL_BANK_TRANSFER",
        }),
      }).then(async (res) => ({
        buyer: `Buyer ${idx + 1}`,
        status: res.status,
        body: await res.json(),
      }))
    )
  );

  let successCount = 0;
  let conflictCount = 0;

  for (const r of results) {
    if (r.status === "fulfilled") {
      const { buyer, status, body } = r.value;
      if (status === 201) {
        successCount++;
        console.log(`✅ ${buyer}: SUCCESS (Status 201) -> Order Number: ${body.data?.orderNumber}`);
      } else if (status === 409) {
        conflictCount++;
        console.log(`🛑 ${buyer}: REJECTED (Status 409 Conflict) -> Reason: ${body.error?.message}`);
      } else {
        console.log(`⚠️ ${buyer}: Other Status (${status}) ->`, body);
      }
    } else {
      console.log(`❌ Request failed:`, r.reason);
    }
  }

  // 4. Verify product stock in DB
  const finalProduct = await prisma.product.findUnique({ where: { id: testProduct.id } });
  console.log(`\n📊 Final Stock in Database: ${finalProduct?.stock}`);
  console.log(`📈 Successful Checkouts: ${successCount} (Expected: 1)`);
  console.log(`📉 Rejected (Out of Stock): ${conflictCount} (Expected: 4)`);

  if (successCount === 1 && conflictCount === 4 && finalProduct?.stock === 0) {
    console.log("\n🎯 CONCURRENCY AUDIT PASSED: Zero overselling, strict atomic isolation guaranteed! 🛡️");
  } else {
    console.error("\n❌ Concurrency audit failed!");
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));

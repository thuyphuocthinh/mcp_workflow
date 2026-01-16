import { providers } from "./providers/index.js";

/**
 * Bootstrap all MCP servers with better error handling
 */
async function bootstrap() {
  console.log("🚀 Starting MCP Servers...\n");

  const results = await Promise.allSettled(
    providers.map((p) => p.start())
  );

  // Log results
  let successCount = 0;
  let failCount = 0;

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      successCount++;
    } else {
      failCount++;
      console.error(`❌ [${providers[i].name}] Failed to start:`, result.reason);
    }
  });

  console.log(`\n📊 Results: ${successCount} started, ${failCount} failed`);

  if (failCount > 0) {
    console.warn("⚠️  Some servers failed to start. Check logs above.");
  } else {
    console.log("✅ All MCP servers started successfully!");
  }
}

bootstrap().catch((err) => {
  console.error("❌ Fatal error during bootstrap:", err);
  process.exit(1);
});

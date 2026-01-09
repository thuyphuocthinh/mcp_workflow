import { main as startCalculator } from "./providers/calculator/index.js";
import { main as startDocs } from "./providers/google_docs/index.v2.js";
import { main as startMail } from "./providers/gmail/index.js";
import { main as startSheet } from "./providers/google_sheets/index.js";
import { main as startSearch } from "./providers/google_search/index.js";

async function bootstrap() {
  await Promise.all([
    startCalculator(),
    startDocs(),
    startMail(),
    startSheet(),
    startSearch(),
  ]);

  console.log("✅ All MCP servers started");
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start MCP servers", err);
  process.exit(1);
});

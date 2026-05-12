/**
 * index.js — VisionEngine Entry Point
 *
 * Responsibilities:
 *   1. Load environment variables (must happen FIRST)
 *   2. Boot the Singleton Playwright browser
 *   3. Start the Express HTTP server
 *   4. Register graceful shutdown hooks (SIGINT, SIGTERM)
 */

import "dotenv/config";
import app from "./src/server.js";
import browserManager from "./src/services/browserManager.js";

const PORT = parseInt(process.env.PORT, 10) || 4000;

/**
 * Boot sequence — sequential, fail-fast.
 */
async function boot() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║        VisionEngine — Starting Up...        ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log();

  // ── Step 1: Validate critical env vars ──
  if (!process.env.API_SECRET_KEY || process.env.API_SECRET_KEY === "change-me-to-a-strong-random-string") {
    console.warn("⚠️  WARNING: API_SECRET_KEY is not set or still using the default placeholder!");
    console.warn("   Set a strong random key in your .env file for production.\n");
  }

  // ── Step 2: Launch the Singleton Playwright browser ──
  try {
    await browserManager.launch();
  } catch (error) {
    console.error("💀 FATAL: Could not launch the browser engine. Exiting.");
    console.error("   Hint: Run `npx playwright install chromium` if browsers are not installed.\n");
    process.exit(1);
  }

  // ── Step 3: Start HTTP server ──
  app.listen(PORT, () => {
    console.log();
    console.log(`🟢 VisionEngine is live on http://localhost:${PORT}`);
    console.log(`   Health check:  GET  http://localhost:${PORT}/api/health`);
    console.log(`   Scrape site:   POST http://localhost:${PORT}/api/fetch-site`);
    console.log();
  });
}

// ─── Graceful Shutdown ──────────────────────────────────────────────────────────
async function gracefulShutdown(signal) {
  console.log(`\n🔴 Received ${signal}. Shutting down gracefully...`);

  await browserManager.shutdown();

  console.log("👋 VisionEngine stopped. Goodbye.\n");
  process.exit(0);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Handle unhandled rejections
process.on("unhandledRejection", (reason) => {
  console.error("❗ Unhandled Promise Rejection:", reason);
});

// ── Go! ──
boot();

/**
 * server.js — Express Application Factory
 *
 * Configures middleware, CORS, routes, and global error handling.
 * Exported as a pure app instance (no .listen() here — that lives in index.js).
 */
import express from "express";
import cors from "cors";
import authGuard from "./middleware/authGuard.js";
import scrapeRoutes from "./routes/scrapeRoutes.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";
const app = express();
// ─── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim());
app.use(cors({
    origin(origin, callback) {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        return callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "x-api-key"],
}));
// ─── Body Parsers (50MB limit for large DOM payloads) ───────────────────────────
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// ─── Request Logger (lightweight) ───────────────────────────────────────────────
app.use((req, _res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});
// ─── Routes ─────────────────────────────────────────────────────────────────────
// Health check is public (no auth) — registered BEFORE authGuard
import browserManager from "./services/browserManager.js";
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        browserReady: browserManager.isReady(),
        uptime: Math.floor(process.uptime()),
        memoryUsage: {
            rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB`,
            heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
        },
    });
});
// All other /api routes require API key
app.use("/api", authGuard, scrapeRoutes);
app.use("/api", authGuard, analyzeRoutes);
// ─── 404 Handler ────────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: "Endpoint not found.",
    });
});
export default app;

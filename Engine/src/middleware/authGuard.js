/**
 * authGuard.js — API Key Authentication Middleware
 *
 * Protects all /api/* routes (except /api/health) by verifying the
 * `x-api-key` header against the server's API_SECRET_KEY env var.
 *
 * Timing-safe comparison is used to prevent timing attacks.
 */

import { timingSafeEqual } from "node:crypto";

/**
 * Compare two strings in constant time.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function safeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;

  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  return timingSafeEqual(bufA, bufB);
}

/**
 * Express middleware — checks x-api-key header.
 */
export default function authGuard(req, res, next) {
  const serverKey = process.env.API_SECRET_KEY;

  // If no key is configured on the server, deny all requests (fail-closed)
  if (!serverKey) {
    console.error("[AuthGuard] ❌ API_SECRET_KEY is not set in environment!");
    return res.status(500).json({
      success: false,
      error: "Server misconfiguration: API key not set.",
    });
  }

  const clientKey = req.headers["x-api-key"];

  if (!clientKey) {
    return res.status(401).json({
      success: false,
      error: "Missing 'x-api-key' header.",
    });
  }

  if (!safeCompare(clientKey, serverKey)) {
    return res.status(403).json({
      success: false,
      error: "Invalid API key.",
    });
  }

  // Key is valid — proceed
  next();
}

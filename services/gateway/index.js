const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 8080;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:8081";
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:8082";
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || "http://localhost:8083";
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://localhost:8084";

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "gateway" });
});

// Aggregates health of all downstream services - handy for checking your mesh/cluster
app.get("/api/status", async (req, res) => {
  const targets = {
    product: `${PRODUCT_SERVICE_URL}/health`,
    user: `${USER_SERVICE_URL}/health`,
    cart: `${CART_SERVICE_URL}/health`,
    order: `${ORDER_SERVICE_URL}/health`,
  };

  const results = {};
  await Promise.all(
    Object.entries(targets).map(async ([name, url]) => {
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(2000) });
        results[name] = r.ok ? "up" : `error (${r.status})`;
      } catch (e) {
        results[name] = "unreachable";
      }
    })
  );
  res.json(results);
});

// Safely relay a downstream response: falls back to text + a synthetic
// JSON error if the downstream didn't return valid JSON (e.g. a proxy
// rejection page), so the gateway never crashes on a malformed reply.
async function relay(r, res) {
  const text = await r.text();
  try {
    res.status(r.status).json(JSON.parse(text));
  } catch {
    res.status(r.status || 502).json({ error: "upstream returned non-JSON response", body: text });
  }
}

app.get("/api/products", async (req, res) => {
  const r = await fetch(`${PRODUCT_SERVICE_URL}/products`);
  await relay(r, res);
});

app.get("/api/users", async (req, res) => {
  const r = await fetch(`${USER_SERVICE_URL}/users`);
  await relay(r, res);
});

app.post("/api/carts/:userId/items", async (req, res) => {
  const r = await fetch(`${CART_SERVICE_URL}/carts/${req.params.userId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });
  await relay(r, res);
});

app.get("/api/carts/:userId", async (req, res) => {
  const r = await fetch(`${CART_SERVICE_URL}/carts/${req.params.userId}`);
  await relay(r, res);
});

app.post("/api/orders", async (req, res) => {
  const r = await fetch(`${ORDER_SERVICE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });
  await relay(r, res);
});

app.listen(PORT, () => {
  console.log(`gateway listening on :${PORT}`);
});

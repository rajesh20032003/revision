const express = require("express");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:8081";

// in-memory carts: { userId: [{ productId, quantity }] }
const carts = {};

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "cart-service" });
});

app.get("/carts/:userId", (req, res) => {
  const { userId } = req.params;
  res.json(carts[userId] || []);
});

app.post("/carts/:userId/items", async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ error: "productId and quantity are required" });
  }

  try {
    const response = await fetch(`${PRODUCT_SERVICE_URL}/products/${productId}`);
    if (!response.ok) {
      return res.status(404).json({ error: "product not found" });
    }
    const product = await response.json();

    if (!carts[userId]) carts[userId] = [];
    carts[userId].push({ productId: product.id, name: product.name, price: product.price, quantity });

    res.status(201).json(carts[userId]);
  } catch (err) {
    res.status(502).json({ error: "could not reach product-service", detail: err.message });
  }
});

app.delete("/carts/:userId", (req, res) => {
  delete carts[req.params.userId];
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`cart-service listeninggs on :${PORT}`);
});

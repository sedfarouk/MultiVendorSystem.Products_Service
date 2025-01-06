const Product = require("../database/models/Product");
const ProductService = require("../services/product-service");
const { PublishMessage, SubscribeMessage } = require("../utils");
const { auth, isSeller } = require("./middleware/auth");

const productRoutes = (app, channel) => {
  const service = new ProductService();
  SubscribeMessage(channel, service);

  app.get("/", async (req, res) => {
    try {
      const { data } = await service.getProducts();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.post("/product/create", isSeller, async (req, res) => {
    const { name, description, image, category, inventoryCount, price, available } = req.body;
    const merchant = req.user._id;
    const { data } = await service.createProduct({
      name,
      description,
      image,
      category,
      inventoryCount,
      price,
      available,
      merchant,
    });
    return res.json(data);
  });

  app.put("/product/:id", isSeller, async (req, res) => {
    const productId = req.params.id;
    const { name, description, image, category, inventoryCount, price, available } = req.body;
    const merchant = req.user._id;

    try {
      const { data } = await service.updateProduct(productId, {
        name,
        description,
        image,
        category,
        inventoryCount,
        price,
        available,
        merchant,
      });

      if (!data) {
        return res.status(404).json({ error: "Product not found" });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/product/:id", isSeller, async (req, res) => {
    const productId = req.params.id;

    const foundProduct = await Product.findById(productId);
    if (foundProduct.merchant == req.user._id) {
      const deletedProduct = await Product.findByIdAndDelete(productId);
      res.json(deletedProduct);
    } else {
      res.status(403).json({ error: "Unauthorized to delete this product" });
    }
  });

  app.get("/category/:category", async (req, res) => {
    const category = req.params.category;

    try {
      const { data } = await service.getProductsByCategory(category);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.get("/:id", async (req, res) => {
    const productId = req.params.id;

    try {
      const { data } = await service.getProductDescription(productId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.post("/ids", async (req, res) => {
    const { ids } = req.body;
    const products = await service.getSelectedProducts(ids);
    return res.status(200).json(products);
  });

  app.put("/wishlist", auth, async (req, res) => {
    const { _id } = req.user;

    const { data } = await service.getProductPayload(
      _id,
      { productId: req.body._id },
      "ADD_TO_WISHLIST"
    );

    PublishMessage(
      channel,
      process.env.CUSTOMER_BINDING_KEY,
      JSON.stringify(data)
    );

    res.status(200).json(data.data.product);
  });

  app.delete("/wishlist/:id", auth, async (req, res) => {
    const { _id } = req.user;
    const productId = req.params.id;

    const { data } = await service.getProductPayload(
      _id,
      { productId },
      "REMOVE_FROM_WISHLIST"
    );

    PublishMessage(
      channel,
      process.env.CUSTOMER_BINDING_KEY,
      JSON.stringify(data)
    );

    res.status(200).json(data.data.product);
  });

  app.put("/cart", auth, async (req, res) => {
    const { _id } = req.user;

    const { data } = await service.getProductPayload(
      _id,
      { productId: req.body.product._id, amount: req.body.amount },
      "ADD_TO_CART"
    );

    PublishMessage(
      channel,
      process.env.CUSTOMER_BINDING_KEY,
      JSON.stringify(data)
    );
    PublishMessage(
      channel,
      process.env.SHOPPING_BINDING_KEY,
      JSON.stringify(data)
    );

    const response = { product: data.data.product, stock: data.data.amount };

    res.status(200).json(response);
  });

  app.delete("/cart/:id", auth, async (req, res) => {
    const { _id } = req.user;
    const productId = req.params.id;

    const { data } = await service.getProductPayload(
      _id,
      { productId },
      "REMOVE_FROM_CART"
    );

    PublishMessage(
      channel,
      process.env.CUSTOMER_BINDING_KEY,
      JSON.stringify(data)
    );
    PublishMessage(
      channel,
      process.env.SHOPPING_BINDING_KEY,
      JSON.stringify(data)
    );

    const response = { product: data.data.product, stock: data.data.amount };

    res.status(200).json(response);
  });
};

module.exports = productRoutes;
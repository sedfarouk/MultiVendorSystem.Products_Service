const ProductRepository = require("../database/repository/product-repository");
const { formatData } = require("../utils/index");

class ProductService {
  constructor() {
    this.repository = new ProductRepository();
  }

  async createProduct(productInputs) {
    const productResult = await this.repository.createProduct(productInputs);
    return formatData(productResult);
  }

  async getProducts() {
    const products = await this.repository.getAllProducts();

    let categories = {};

    products.forEach(({ category }) => {
      categories[category] = category;
    });

    return formatData({
      products,
      categories: Object.keys(categories),
    });
  }

  async updateProduct(productId, updatedData) {
    const updatedProduct = await this.repository.updateProduct(productId, updatedData);
    return formatData(updatedProduct);
  }

  async getProductDescription(productId) {
    const product = await this.repository.getProductById(productId);
    return formatData(product);
  }

  async getProductsByCategory(category) {
    const products = await this.repository.getProductsByCategory(category);
    return formatData(products);
  }

  async getSelectedProducts(selectedIds) {
    const products = await this.repository.getSelectedProducts(selectedIds);
    return formatData(products);
  }

  async getProductPayload(userId, { productId, amount }, event) {
    const product = await this.repository.getProductById(productId);

    if (product) {
      const payload = {
        event: event,
        data: { userId, product, amount },
      };

      return formatData(payload);
    } else {
      return formatData({ error: "No product available" });
    }
  }

  async reduceStock(data) {
    for (let i = 0; i < data.length; i++) {
      const product = await this.repository.getProductById(data[i].productId);
      product.inventoryCount -= data[i].productAmountBought;
      if (product.inventoryCount === 0) {
        product.available = false;
      }
      await product.save();
    }
  }

  async subscribeEvents(payload) {
    payload = JSON.parse(payload);
    const { event, data } = payload;

    switch (event) {
      case "REDUCE_PRODUCT_STOCK":
        this.reduceStock(data);
        break;
      default:
        break;
    }
  }
}

module.exports = ProductService;
const mongoose = require('mongoose');
const Product = require("../models/Product");

class ProductRepository {

    async createProduct({ name, description, image, category, inventoryCount, price, available, merchant }) {
        const product = new Product({
            name, description, image, category, inventoryCount, price, available, merchant
        });

        return await product.save();
    }

    async getAllProducts() {
        return await Product.find();
    }

    async getProductById(id) {
        return await Product.findById(id);
    }

    async getProductsByCategory(category) {
        return await Product.find({ category });
    }

    async getSelectedProducts(selectedIds) {
        return await Product.find().where('_id').in(selectedIds.map(id => id)).exec();
    }

    async updateProduct(id, updatedData) {
        return await Product.findByIdAndUpdate(
            id,
            { $set: updatedData },
            { new: true }
        );
    }
}

module.exports = ProductRepository;
const mongoose = require("mongoose");

const { Schema } = mongoose;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  category: {
    type: String,
    enum: [
      "Technology",
      "Apparel",
      "Home and Cooking",
      "Health and Wellness",
      "Books and Stationery",
      "Outdoor Activities",
      "Beauty Products",
      "Automotive Parts",
      "Jewelry and Watches",
      "Grocery Items",
      "Baby Essentials",
      "Pet Supplies",
      "Hardware and Tools",
      "Office and School Supplies",
      "Furniture and Decor",
      "Craft and Art Supplies",
      "Video Games and Consoles",
      "Music and Instruments",
    ],
    required: true,
  },
  inventoryCount: { type: Number, required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, default: true },
  merchant: { type: String, required: true },
});

module.exports = mongoose.model("Product", ProductSchema);
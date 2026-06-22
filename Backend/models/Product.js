const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sku: String,
  name: String,
  category: String,
  subcategory: String,
  material: String,
  color: String,
  sizes: String,
  cost_price: Number,
  sale_price: Number,
  stock: Number,
  status: String,
  created_at: Date,
}, { _id: false });

module.exports = mongoose.model('Product', productSchema, 'products');
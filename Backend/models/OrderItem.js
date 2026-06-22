const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  order_id: String,
  line_no: Number,
  product_id: String,
  quantity: Number,
  unit_price: Number,
  discount: Number,
});

module.exports = mongoose.model('OrderItem', orderItemSchema, 'order_items');
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  order_date: Date,
  customer_id: String,
  totals_subtotal: Number,
  totals_shipping_fee: Number,
  totals_grand_total: Number,
  status: String,
  payment_method: String,
  channel: String,
  province: String,
  shipped_at: Date,
  completed_at: Date,
}, { _id: false });

module.exports = mongoose.model('Order', orderSchema, 'orders');
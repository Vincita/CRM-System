const mongoose = require('mongoose');

const customerV2Schema = new mongoose.Schema({
  _id: { type: String, required: true },  // CUST0001, ...
  name: String,
  email: String,
  phone: String,
  gender: String,
  birth_date: String,
  province: String,
  district: String,
  address: String,
  registered_at: Date,
  segment: String,
  lifetime_value: Number,
  total_orders: Number,
  last_order_date: String,
}, { _id: false });

module.exports = mongoose.model('CustomerV2', customerV2Schema, 'customers');
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const moment = require("moment-timezone");

// Models
const Customer = require("../models/Customer");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const OrderItem = require("../models/OrderItem");

const app = express();

// ==================== CORS ====================
app.use(
  cors({
    origin: ["https://wingws-crm-demo.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());

// ==================== HÀM LẤY THỜI GIAN VN ====================
function getVietnamTime() {
  return moment.tz("Asia/Ho_Chi_Minh").toDate();
}

function getTodayVietnam() {
  const now = getVietnamTime();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return today;
}

function getTomorrowVietnam(today) {
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

// ==================== KẾT NỐI MONGODB ====================
const MONGO_URI =
  "mongodb://username:password@ac-mu9itkj-shard-00-00.dxvesks.mongodb.net:27017,ac-mu9itkj-shard-00-01.dxvesks.mongodb.net:27017,ac-mu9itkj-shard-00-02.dxvesks.mongodb.net:27017/crm_demo?ssl=true&replicaSet=atlas-8o1kqf-shard-0&authSource=admin&appName=Cluster0";

let mongooseConnection = null;

async function connectDB() {
  if (mongooseConnection) return mongooseConnection;
  try {
    mongooseConnection = await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected Successfully");
    return mongooseConnection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
connectDB().catch(console.error);

// ==================== TEST ROUTE ====================
app.get("/", (req, res) => {
  res.json({ success: true, message: "CRM API Running" });
});

// ==================== CUSTOMERS CRUD ====================

// GET all customers
app.get("/api/customers", async (req, res) => {
  try {
    await connectDB();
    const { search, page = 1, limit = 20 } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { _id: { $regex: search, $options: "i" } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const customers = await Customer.find(query)
      .sort({ registered_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Customer.countDocuments(query);
    const mapped = customers.map((c) => ({
      id: c._id,
      code: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone || "",
      gender: c.gender || "",
      birth_date: c.birth_date || "",
      province: c.province || "",
      district: c.district || "",
      address: c.address || "",
      segment: c.segment || "Thường",
      lifetime_value: c.lifetime_value || 0,
      total_orders: c.total_orders || 0,
      last_order_date: c.last_order_date || "",
      registered_at: c.registered_at,
    }));
    res.json({
      success: true,
      total,
      data: mapped,
      pagination: { page, limit, total },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET one customer
app.get("/api/customers/:maKH", async (req, res) => {
  try {
    await connectDB();
    const c = await Customer.findOne({ _id: req.params.maKH });
    if (!c) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    res.json({
      success: true,
      data: {
        id: c._id,
        code: c._id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        gender: c.gender,
        birth_date: c.birth_date,
        province: c.province,
        district: c.district,
        address: c.address,
        segment: c.segment,
        lifetime_value: c.lifetime_value,
        total_orders: c.total_orders,
        last_order_date: c.last_order_date,
        registered_at: c.registered_at,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE customer
app.post("/api/customers", async (req, res) => {
  try {
    await connectDB();
    const { name, email, phone, gender, birth_date, province, district, address } = req.body;
    if (!name || !email)
      return res.status(400).json({ success: false, message: "Thiếu tên hoặc email" });
    const last = await Customer.findOne().sort({ _id: -1 });
    let newId = "CUST0001";
    if (last && last._id) {
      const num = parseInt(last._id.slice(4)) + 1;
      newId = `CUST${num.toString().padStart(4, "0")}`;
    }
    const newCustomer = new Customer({
      _id: newId,
      name,
      email,
      phone: phone || "",
      gender: gender || "",
      birth_date: birth_date || "",
      province: province || "",
      district: district || "",
      address: address || "",
      registered_at: getVietnamTime(),
      segment: "Thường",
      lifetime_value: 0,
      total_orders: 0,
    });
    await newCustomer.save();
    res.status(201).json({
      success: true,
      data: {
        id: newId,
        code: newId,
        name,
        email,
        phone: phone || "",
        gender: gender || "",
        birth_date: birth_date || "",
        province: province || "",
        district: district || "",
        address: address || "",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE customer
app.put("/api/customers/:maKH", async (req, res) => {
  try {
    await connectDB();
    const { name, email, phone, gender, birth_date, province, district, address } = req.body;
    const updateData = { name, email, phone, gender, birth_date, province, district, address };
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);
    const result = await Customer.updateOne({ _id: req.params.maKH }, { $set: updateData });
    if (result.matchedCount === 0)
      return res.status(404).json({ success: false, message: "Không tìm thấy" });
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE customer
app.delete("/api/customers/:maKH", async (req, res) => {
  try {
    await connectDB();
    const orders = await Order.countDocuments({ customer_id: req.params.maKH });
    if (orders > 0)
      return res
        .status(400)
        .json({ success: false, message: "Không thể xóa khách hàng đã có đơn hàng" });
    const result = await Customer.deleteOne({ _id: req.params.maKH });
    if (result.deletedCount === 0)
      return res.status(404).json({ success: false, message: "Không tìm thấy" });
    res.json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== DASHBOARD STATS ====================
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    await connectDB();

    const today = getTodayVietnam();
    const tomorrow = getTomorrowVietnam(today);

    const { channel } = req.query;

    const orderFilter = {};
    if (channel) {
      orderFilter.channel = channel;
    }

    const todayOrderFilter = {
      ...orderFilter,
      order_date: { $gte: today, $lt: tomorrow },
    };

    // Khách hàng
    const totalCustomers = await Customer.countDocuments();
    const newCustomersToday = await Customer.countDocuments({
      registered_at: { $gte: today, $lt: tomorrow },
    });

    // Đơn hàng
    const totalOrders = await Order.countDocuments(orderFilter);
    const todayOrders = await Order.countDocuments(todayOrderFilter);

    // Doanh thu
    const revenueAgg = await Order.aggregate([
      { $match: orderFilter },
      { $group: { _id: null, total: { $sum: "$totals_grand_total" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const todayRevenueAgg = await Order.aggregate([
      { $match: todayOrderFilter },
      { $group: { _id: null, total: { $sum: "$totals_grand_total" } } },
    ]);
    const todayRevenue = todayRevenueAgg[0]?.total || 0;

    // Tổng sản phẩm đã bán
    const orderIds = await Order.find(orderFilter, { _id: 1 });
    const orderIdList = orderIds.map((o) => o._id);

    const soldItemsAgg = await OrderItem.aggregate([
      { $match: { order_id: { $in: orderIdList } } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);
    const totalProductsSold = soldItemsAgg[0]?.total || 0;

    // Khách cũ quay lại hôm nay
    const repeatCustomersAgg = await Order.aggregate([
      { $match: todayOrderFilter },
      { $group: { _id: "$customer_id", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      { $match: { "customer.total_orders": { $gt: 1 } } },
      { $count: "total" },
    ]);
    const repeatCustomersToday = repeatCustomersAgg[0]?.total || 0;

    // Thống kê theo kênh
    const channelStats = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: "$channel", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const channels = {};
    channelStats.forEach((item) => {
      channels[item._id] = item.count;
    });

    // Khách mới theo kênh hôm nay
    const newCustomerChannelAgg = await Order.aggregate([
      { $match: { order_date: { $gte: today, $lt: tomorrow } } },
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      { $match: { "customer.total_orders": 1 } },
      { $group: { _id: "$channel", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue,
        todayRevenue,
        totalOrders,
        todayOrders,
        totalCustomers,
        newCustomersToday,
        repeatCustomersToday,
        totalProductsSold,
        channels,
        activeChannel: channel || null,
        newCustomersByChannel: newCustomerChannelAgg,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PRODUCTS CRUD ====================

app.get("/api/products", async (req, res) => {
  try {
    await connectDB();
    const { page = 1, limit = 20, category, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find(query).skip(skip).limit(parseInt(limit));
    const total = await Product.countDocuments(query);
    res.json({ success: true, data: products, pagination: { page, limit, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    await connectDB();
    const product = await Product.findOne({ _id: req.params.id });
    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    await connectDB();
    const { sku, name, category, subcategory, material, color, sizes, cost_price, sale_price, stock } =
      req.body;
    if (!sku || !name)
      return res.status(400).json({ success: false, message: "Thiếu sku hoặc tên" });
    const existing = await Product.findOne({ sku });
    if (existing) return res.status(400).json({ success: false, message: "SKU đã tồn tại" });
    const newProduct = new Product({
      _id: `PROD${Date.now()}`,
      sku,
      name,
      category,
      subcategory,
      material,
      color,
      sizes,
      cost_price,
      sale_price,
      stock,
      status: "active",
      created_at: getVietnamTime(),
    });
    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    await connectDB();
    const result = await Product.updateOne({ _id: req.params.id }, { $set: req.body });
    if (result.matchedCount === 0)
      return res.status(404).json({ success: false, message: "Không tìm thấy" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await connectDB();
    const used = await OrderItem.countDocuments({ product_id: req.params.id });
    if (used > 0)
      return res
        .status(400)
        .json({ success: false, message: "Sản phẩm đã có trong đơn hàng" });
    const result = await Product.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0)
      return res.status(404).json({ success: false, message: "Không tìm thấy" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ORDERS & ORDER ITEMS ====================

app.get("/api/orders", async (req, res) => {
  try {
    await connectDB();
    const { page = 1, limit = 20, customer_id, from, to } = req.query;
    const query = {};
    if (customer_id) query.customer_id = customer_id;

    // ===== XỬ LÝ LỌC THEO NGÀY (CHO PHÉP CHỌN CÙNG 1 NGÀY) =====
    if (from || to) {
      query.order_date = {};
      let fromDate, toDate;

      if (from) {
        fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        query.order_date.$gte = fromDate;
      }

      if (to) {
        toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.order_date.$lte = toDate;
      }

      // Trường hợp chỉ có from mà không có to
      if (from && !to) {
        toDate = new Date(from);
        toDate.setHours(23, 59, 59, 999);
        query.order_date.$lte = toDate;
      }

      // Trường hợp chỉ có to mà không có from
      if (to && !from) {
        fromDate = new Date(to);
        fromDate.setHours(0, 0, 0, 0);
        query.order_date.$gte = fromDate;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(query)
      .sort({ order_date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Order.countDocuments(query);
    res.json({ success: true, data: orders, pagination: { page, limit, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    await connectDB();
    const order = await Order.findOne({ _id: req.params.id });
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    const items = await OrderItem.find({ order_id: req.params.id });
    res.json({ success: true, data: { ...order.toObject(), items } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    await connectDB();
    const { customer_id, items, payment_method, channel, province, shipping_fee = 0 } = req.body;
    if (!customer_id || !items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin khách hàng hoặc sản phẩm" });
    }

    let subtotal = 0;
    const orderItems = [];
    for (const it of items) {
      const product = await Product.findOne({ _id: it.product_id });
      if (!product) throw new Error(`Sản phẩm ${it.product_id} không tồn tại`);
      const unitPrice = product.sale_price;
      const discount = it.discount || 0;
      const lineTotal = (unitPrice - discount) * it.quantity;
      subtotal += lineTotal;
      orderItems.push({
        product_id: it.product_id,
        quantity: it.quantity,
        unit_price: unitPrice,
        discount,
      });
    }

    const grandTotal = subtotal + shipping_fee;
    const lastOrder = await Order.findOne().sort({ _id: -1 });
    let newId = "ORD0001";
    if (lastOrder && lastOrder._id) {
      const num = parseInt(lastOrder._id.slice(3)) + 1;
      newId = `ORD${num.toString().padStart(4, "0")}`;
    }

    const nowVN = getVietnamTime();

    const order = new Order({
      _id: newId,
      order_date: nowVN,
      customer_id,
      totals_subtotal: subtotal,
      totals_shipping_fee: shipping_fee,
      totals_grand_total: grandTotal,
      status: "completed",
      payment_method,
      channel,
      province,
    });
    await order.save();

    // Insert order items
    for (let i = 0; i < orderItems.length; i++) {
      orderItems[i].order_id = newId;
      orderItems[i].line_no = i + 1;
    }
    await OrderItem.insertMany(orderItems);

    // Update customer stats
    const customer = await Customer.findOne({ _id: customer_id });
    if (customer) {
      const newTotalOrders = (customer.total_orders || 0) + 1;
      const newLifetime = (customer.lifetime_value || 0) + grandTotal;
      await Customer.updateOne(
        { _id: customer_id },
        {
          $set: {
            total_orders: newTotalOrders,
            lifetime_value: newLifetime,
            last_order_date: nowVN,
          },
        }
      );
    }

    res.status(201).json({ success: true, data: { order, items: orderItems } });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    await connectDB();
    const { status } = req.body;
    if (!["completed", "shipped", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ" });
    }
    const result = await Order.updateOne({ _id: req.params.id }, { $set: { status } });
    if (result.matchedCount === 0)
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== AUTHENTICATION ====================

app.post("/api/register", async (req, res) => {
  try {
    await connectDB();
    const { name, username, password } = req.body;
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Username đã tồn tại" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      password: hashedPassword,
    });
    res.status(201).json({
      success: true,
      data: { _id: user._id, name: user.name, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    await connectDB();
    const { username, password } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
    }
    res.json({
      success: true,
      data: { _id: user._id, name: user.name, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;
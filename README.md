# CRM System - MVP V2

A full-stack Customer Relationship Management (CRM) system that helps businesses manage customers, products, orders, inventory, and sales analytics through an interactive dashboard.

---

## 📖 Project Overview

CRM System MVP V2 was developed to centralize customer and sales management processes. The system provides:

- Customer Management
- Product & Inventory Management
- Order Processing
- Sales Dashboard
- Power BI Analytics Integration
- Authentication & Protected Routes

The project follows a Full Stack architecture with:

- Frontend: React + TypeScript
- Backend: Node.js + Express
- Database: MongoDB
- Analytics: Power BI

---

## 🚀 Features

### 🔐 Authentication
- User Login
- Authentication Context
- Protected Routes
- Public Routes

### 👥 Customer Management
- Create Customer
- View Customer List
- Update Customer Information
- Delete Customer
- Search Customers

### 📦 Product Management
- Add Products
- Edit Product Information
- Inventory Tracking
- Product Status Management

### 🛒 Order Management
- Create Orders
- Order Detail Tracking
- Customer-Product Relationship
- Automatic Total Calculation

### 📊 Dashboard
- Revenue Overview
- Total Customers
- Total Orders
- Inventory Statistics
- KPI Monitoring

### 📈 Business Intelligence
- Embedded Power BI Dashboard
- Sales Analysis
- Customer Insights
- Business Performance Reporting

---

# 🏗️ System Architecture

```text
Frontend (React + TypeScript)
        │
        ▼
 REST API (Axios)
        │
        ▼
Backend (Node.js + Express)
        │
        ▼
MongoDB Database
        │
        ▼
Power BI Analytics
```

---

# 📂 Project Structure

## Frontend

```text
src/
│
├── api/
│   ├── authApi.ts
│   ├── axiosClient.ts
│   ├── customerApi.ts
│   ├── dashboardApi.ts
│   ├── orderApi.ts
│   └── productApi.ts
│
├── components/
│   └── layout/
│       ├── Header/
│       ├── MainLayout/
│       └── Sidebar/
│
├── context/
│   └── AuthContext.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useCustomers.ts
│   ├── useDashboard.ts
│   ├── useOrders.ts
│   └── useProducts.ts
│
├── pages/
│   ├── login/
│   ├── dashboard/
│   ├── customers/
│   ├── products/
│   ├── inventory/
│   ├── orders/
│   └── powerbi/
│
├── routes/
│   ├── PrivateRoute.tsx
│   └── PublicRoute.tsx
│
├── App.tsx
└── main.tsx
```

---

## Backend

```text
backend/
│
├── api/
│   └── index.js
│
├── models/
│   ├── Customer.js
│   ├── Product.js
│   ├── Order.js
│   ├── OrderItem.js
│   └── User.js
│
├── package.json
├── package-lock.json
└── vercel.json
```

---

# 🗄️ Database Models

## User

```js
User
├── username
├── password
└── role
```

## Customer

```js
Customer
├── customerId
├── fullName
├── email
├── phone
└── address
```

## Product

```js
Product
├── productId
├── productName
├── category
├── price
├── stock
└── status
```

## Order

```js
Order
├── orderId
├── customerId
├── totalAmount
├── orderDate
└── status
```

## OrderItem

```js
OrderItem
├── orderId
├── productId
├── quantity
└── unitPrice
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/your-username/crm-system.git
cd crm-system
```

---

## Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## Backend Setup

```bash
cd backend

npm install

npm start
```

Backend runs on:

```text
http://localhost:3000
```

---

# 🔗 API Modules

| Module | Description |
|----------|-------------|
| authApi | Authentication |
| customerApi | Customer CRUD |
| productApi | Product CRUD |
| orderApi | Order CRUD |
| dashboardApi | Dashboard Statistics |

---

# 📊 Dashboard Metrics

The dashboard provides:

- Total Revenue
- Total Customers
- Total Orders
- Product Inventory
- Sales Performance
- Business KPIs

---

# 📈 Power BI Integration

The system integrates Power BI for:

- Revenue Analysis
- Customer Segmentation
- Product Performance
- Sales Trend Monitoring

---

# 🔮 Future Improvements

### MVP V3

- Role-Based Access Control (RBAC)
- Email Notifications
- Customer Segmentation
- Sales Forecasting
- Inventory Alerts
- Export PDF/Excel Reports
- Real-Time Analytics
- Cloud Deployment

---

# 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- React Router
- Axios
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

### Analytics

- Power BI

### Deployment

- Vercel

---

# 👨‍💻 Author

**Vincita**

CRM System MVP V2

Academic Project / Portfolio Project

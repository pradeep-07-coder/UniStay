# Developer 4 â€” Student Finance, Vouchers, Custom Orders & Helpdesk

Welcome to **Developer 4's** module workspace for the **UniStay** project.

---

## ðŸŽ¯ 1. Role & Module Responsibilities

- **Assigned Domain**: Unified Payment Gateway, Stored-Value Food Vouchers, Custom Itemized Food Orders & Collection, Provider Revenue Wallet & Bank Withdrawals, Helpdesk Inquiries & In-App Notifications, Student Unified Dashboard.
- **Git Feature Branch**: `feature/dev4-finance-vouchers-helpdesk`
- **Target Merge Base**: `main`

### Key Functional Features
1. **Unified Payment Gateway**:
   - Central transaction processor for 1-month accommodation rent passes, 30-day meal subscriptions, and food vouchers.
   - Transaction logging with ACID transaction rollbacks on failure.
2. **Stored-Value Food Vouchers**:
   - Basic (LKR 5,000), Standard (LKR 10,000), and Premium (LKR 15,000) digital dining cards.
   - Live balance tracking and automatic expiration on zero balance.
3. **Custom Itemized Food Orders & Collection Settlement**:
   - Student multi-item food ordering.
   - Kitchen collection confirmation with student voucher code validation and automatic wallet crediting.
4. **Provider Revenue Wallet & Bank Withdrawals**:
   - Provider balance ledger and withdrawal request engine.
5. **Support Helpdesk & System Notifications**:
   - In-app notification bell with unread badge counter and instant mark-read actions.
   - Helpdesk inquiry submission and admin reply engine.
6. **Student Unified Dashboard**:
   - Central student dashboard displaying active bookings, digital meal passes, active vouchers, and past orders.

---

## ðŸ“‚ 2. File & Directory Ownership

```
Developer_4_Finance_Vouchers_Helpdesk/
â”œâ”€â”€ Backend/
â”‚   â”œâ”€â”€ package.json
â”‚   â”œâ”€â”€ .env
â”‚   â””â”€â”€ src/
â”‚       â”œâ”€â”€ server.js                          # Configured to mount payment, voucher, wallet & helpdesk routes
â”‚       â”œâ”€â”€ controllers/
â”‚       â”‚   â”œâ”€â”€ paymentController.js           # Unified checkout processor
â”‚       â”‚   â”œâ”€â”€ walletController.js            # Provider revenue wallet & bank withdrawals
â”‚       â”‚   â”œâ”€â”€ foodOrderController.js         # Custom food orders & voucher pickup settlement
â”‚       â”‚   â”œâ”€â”€ inquiryController.js           # Helpdesk inquiries & admin replies
â”‚       â”‚   â””â”€â”€ notificationController.js      # User system notifications & unread counts
â”‚       â””â”€â”€ routes/
â”‚           â”œâ”€â”€ paymentRoutes.js               # /api/payments
â”‚           â”œâ”€â”€ walletRoutes.js                # /api/wallet
â”‚           â”œâ”€â”€ foodOrderRoutes.js             # /api/food-orders
â”‚           â”œâ”€â”€ inquiryRoutes.js               # /api/inquiries
â”‚           â””â”€â”€ notificationRoutes.js          # /api/notifications
â”‚
â””â”€â”€ Frontend/
    â”œâ”€â”€ package.json
    â”œâ”€â”€ vite.config.js
    â””â”€â”€ src/
        â”œâ”€â”€ App.jsx                            # Dev 4 routes & vouchers landing
        â”œâ”€â”€ pages/
        â”‚   â”œâ”€â”€ FoodVouchers.jsx & .css        # Voucher purchasing & card wallet
        â”‚   â”œâ”€â”€ PaymentPage.jsx & .css         # Unified checkout screen
        â”‚   â””â”€â”€ StudentDashboard.jsx & .css    # Student master dashboard
        â”œâ”€â”€ context/AuthContext.jsx
        â”œâ”€â”€ services/api.js
        â””â”€â”€ components/
```

---

## ðŸš€ 3. How to Run Locally

### Start Backend
```bash
cd Backend
npm install
npm start
# Runs on http://localhost:5000 (API Health: http://localhost:5000/api/health)
```

### Start Frontend
```bash
cd Frontend
npm install
npm run dev
# Runs on http://localhost:5173 (Directs to /vouchers)
```

---

## ðŸ“¡ 4. Endpoints Owned
- `POST /api/payments/process`
- `GET /api/subscriptions/student/vouchers`
- `POST /api/food-orders/place`
- `GET /api/food-orders/student`
- `GET /api/food-orders/provider`
- `PATCH /api/food-orders/:order_id/status`
- `POST /api/food-orders/:order_id/confirm-voucher`
- `GET /api/wallet/balance`
- `POST /api/wallet/withdraw`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `POST /api/inquiries`
- `GET /api/inquiries`
- `PATCH /api/inquiries/:id/respond`

---

## ðŸ”„ 5. Git Commit & Push Workflow

```bash
# Initialize or checkout branch
git checkout -b feature/dev4-finance-vouchers-helpdesk

# Stage your modified files
git add Backend/src/controllers/paymentController.js
git add Backend/src/controllers/walletController.js
git add Backend/src/controllers/foodOrderController.js
git add Backend/src/controllers/inquiryController.js
git add Backend/src/controllers/notificationController.js
git add Backend/src/routes/paymentRoutes.js
git add Backend/src/routes/walletRoutes.js
git add Backend/src/routes/foodOrderRoutes.js
git add Backend/src/routes/inquiryRoutes.js
git add Backend/src/routes/notificationRoutes.js
git add Frontend/src/pages/FoodVouchers.*
git add Frontend/src/pages/PaymentPage.*
git add Frontend/src/pages/StudentDashboard.*

# Commit with semantic message
git commit -m "feat(fintech): implement payments, food vouchers, wallet withdrawals, and helpdesk"

# Push to GitHub
git push -u origin feature/dev4-finance-vouchers-helpdesk
```
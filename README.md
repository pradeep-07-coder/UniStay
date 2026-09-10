<<<<<<< HEAD
<<<<<<< HEAD
# Developer 2 â€” Accommodations, Housing Discovery & Landlord Operations

Welcome to **Developer 2's** module workspace for the **UniStay** project.
=======
# Developer 4 â€” Student Finance, Vouchers, Custom Orders & Helpdesk

Welcome to **Developer 4's** module workspace for the **UniStay** project.
>>>>>>> 69c5178f071b6781906c8d3cb8f78ae2f9202a0f
=======
# Developer 1 â€” Identity, Core Platform & Administrator Console Workspace

Welcome to **Developer 1's** module workspace for the **UniStay** project.
>>>>>>> f918e59174354a541a888ca56b5437c45559316d

---

## ðŸŽ¯ 1. Role & Module Responsibilities

<<<<<<< HEAD
<<<<<<< HEAD
- **Assigned Domain**: Accommodation Listings CRUD, Haversine 5km Campus Proximity Search, Property Owner Dashboard, Booking Lifecycle & Student Reviews.
- **Git Feature Branch**: `feature/dev2-accommodations-booking`
- **Target Merge Base**: `main`

### Key Functional Features
1. **Housing Discovery & Campus Proximity Engine**:
   - Haversine trigonometric formula to filter listings within a strict 5.0 km radius of the selected university campus.
   - Interactive price range, room type, and A/C filters.
   - Accommodation detail view with gallery photo slider, facilities list, host profile, and reviews.
2. **Property Owner Dashboard**:
   - Verified Landlord listing creation with up to 5 photos uploaded to Cloudinary.
   - Listing updates, room availability toggles, and deletion.
   - Incoming student booking request inspection and approval/rejection.
3. **Accommodation Booking Engine**:
   - Student booking request placement (`pending`).
   - Landlord status transition (`approved` / `rejected`).
   - Automatic property availability updating (`availability_status = false` upon approval).
   - Student cancellation with automatic availability restoration.
4. **Ratings & Reviews**:
   - Student rating (1-5 stars) and feedback comments with review update capability.
=======
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
>>>>>>> 69c5178f071b6781906c8d3cb8f78ae2f9202a0f
=======
- **Assigned Domain**: Authentication, Authorization, RBAC Middleware, User Profile Management, Campus Geolocation Registry, and Administrator Console.
- **Git Feature Branch**: `feature/dev1-auth-admin-core`
- **Target Merge Base**: `main`

### Key Functional Features
1. **User Identity & Access Management (IAM)**:
   - Registration for Students, Property Owners, Meal Providers, and System Admins.
   - Unified secure login with automatic role detection (`student`, `property_owner`, `meal_provider`, `admin`).
   - Secure password hashing (`bcryptjs`) and session security (`jsonwebtoken`).
   - User profile management and Cloudinary avatar uploads.
2. **Administration Console**:
   - Verification queue for pending Property Owners and Meal Providers.
   - Account suspension & reactivation controls.
   - University Campus registration with GPS coordinates.
   - Platform analytics and health reporting.
3. **Core Application Shell**:
   - Navigation bar with notifications hook and profile dropdown.
   - Global responsive footer and layout styling.
   - Home landing page, About page, and Contact page.
>>>>>>> f918e59174354a541a888ca56b5437c45559316d

---

## ðŸ“‚ 2. File & Directory Ownership

```
<<<<<<< HEAD
<<<<<<< HEAD
Developer_2_Accommodations_Booking/
=======
Developer_4_Finance_Vouchers_Helpdesk/
>>>>>>> 69c5178f071b6781906c8d3cb8f78ae2f9202a0f
=======
Developer_1_Auth_Admin_Core/
>>>>>>> f918e59174354a541a888ca56b5437c45559316d
â”œâ”€â”€ Backend/
â”‚   â”œâ”€â”€ package.json
â”‚   â”œâ”€â”€ .env
â”‚   â””â”€â”€ src/
<<<<<<< HEAD
<<<<<<< HEAD
â”‚       â”œâ”€â”€ server.js                          # Configured to mount accommodation & booking routes
â”‚       â”œâ”€â”€ config/cloudinary.js
â”‚       â”œâ”€â”€ db/
â”‚       â”œâ”€â”€ middleware/
â”‚       â”œâ”€â”€ utils/
â”‚       â”œâ”€â”€ controllers/
â”‚       â”‚   â”œâ”€â”€ accommodationController.js     # Listings CRUD, 5km Haversine search, reviews
â”‚       â”‚   â””â”€â”€ bookingController.js           # Reservation lifecycle (pending/approved/rejected)
â”‚       â””â”€â”€ routes/
â”‚           â”œâ”€â”€ accommodationRoutes.js         # /api/accommodations
â”‚           â””â”€â”€ bookingRoutes.js               # /api/bookings
=======
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
>>>>>>> 69c5178f071b6781906c8d3cb8f78ae2f9202a0f
=======
â”‚       â”œâ”€â”€ server.js                          # Configured to mount auth & admin routes
â”‚       â”œâ”€â”€ config/cloudinary.js               # Cloudinary storage connector
â”‚       â”œâ”€â”€ db/                                # DB connection pool & schemas
â”‚       â”œâ”€â”€ middleware/auth.js                 # JWT Bearer verification
â”‚       â”œâ”€â”€ middleware/rbac.js                 # Role guard & verification check
â”‚       â”œâ”€â”€ middleware/upload.js               # Multer image handler
â”‚       â”œâ”€â”€ utils/jwt.js                       # JWT sign & verify helpers
â”‚       â”œâ”€â”€ controllers/
â”‚       â”‚   â”œâ”€â”€ authController.js              # Register, login, profile, avatar
â”‚       â”‚   â””â”€â”€ adminController.js             # Verifications, user status, campuses
â”‚       â””â”€â”€ routes/
â”‚           â”œâ”€â”€ authRoutes.js                  # /api/auth endpoints
â”‚           â””â”€â”€ adminRoutes.js                 # /api/admin endpoints
>>>>>>> f918e59174354a541a888ca56b5437c45559316d
â”‚
â””â”€â”€ Frontend/
    â”œâ”€â”€ package.json
    â”œâ”€â”€ vite.config.js
    â””â”€â”€ src/
<<<<<<< HEAD
<<<<<<< HEAD
        â”œâ”€â”€ App.jsx                            # Dev 2 routes & accommodations landing
        â”œâ”€â”€ pages/
        â”‚   â”œâ”€â”€ Accommodations.jsx & .css      # Search & 5km radius listings
        â”‚   â”œâ”€â”€ AccommodationDetails.jsx & .css# Listing details, gallery & booking form
        â”‚   â””â”€â”€ OwnerDashboard.jsx & .css      # Landlord portal & booking management
=======
        â”œâ”€â”€ App.jsx                            # Dev 4 routes & vouchers landing
        â”œâ”€â”€ pages/
        â”‚   â”œâ”€â”€ FoodVouchers.jsx & .css        # Voucher purchasing & card wallet
        â”‚   â”œâ”€â”€ PaymentPage.jsx & .css         # Unified checkout screen
        â”‚   â””â”€â”€ StudentDashboard.jsx & .css    # Student master dashboard
>>>>>>> 69c5178f071b6781906c8d3cb8f78ae2f9202a0f
        â”œâ”€â”€ context/AuthContext.jsx
        â”œâ”€â”€ services/api.js
        â””â”€â”€ components/
=======
        â”œâ”€â”€ App.jsx                            # Dev 1 routes & stub fallbacks
        â”œâ”€â”€ main.jsx
        â”œâ”€â”€ index.css
        â”œâ”€â”€ App.css
        â”œâ”€â”€ context/AuthContext.jsx            # User state & JWT persistence
        â”œâ”€â”€ services/api.js                    # Axios API client
        â”œâ”€â”€ components/
        â”‚   â”œâ”€â”€ Navbar.jsx & Navbar.css
        â”‚   â”œâ”€â”€ Footer.jsx & Footer.css
        â”‚   â”œâ”€â”€ ProfileSection.jsx & .css
        â”‚   â””â”€â”€ ProtectedRoute.jsx
        â”œâ”€â”€ pages/
        â”‚   â”œâ”€â”€ Home.jsx & Home.css
        â”‚   â”œâ”€â”€ About.jsx
        â”‚   â”œâ”€â”€ Contact.jsx & StaticPages.css
        â”‚   â”œâ”€â”€ Login.jsx & Register.jsx
        â”‚   â”œâ”€â”€ AuthPages.css
        â”‚   â””â”€â”€ AdminDashboard.jsx & AdminDashboard.css
        â””â”€â”€ assets/                            # UniStay logos and branding
>>>>>>> f918e59174354a541a888ca56b5437c45559316d
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
<<<<<<< HEAD
<<<<<<< HEAD
# Runs on http://localhost:5173 (Directs to /accommodations)
=======
# Runs on http://localhost:5173 (Directs to /vouchers)
>>>>>>> 69c5178f071b6781906c8d3cb8f78ae2f9202a0f
=======
# Runs on http://localhost:5173
>>>>>>> f918e59174354a541a888ca56b5437c45559316d
```

---

## ðŸ“¡ 4. Endpoints Owned
<<<<<<< HEAD
<<<<<<< HEAD
- `GET /api/accommodations`
- `GET /api/accommodations/:id`
- `GET /api/accommodations/owner/my-listings`
- `POST /api/accommodations`
- `PUT /api/accommodations/:id`
- `DELETE /api/accommodations/:id`
- `POST /api/accommodations/:id/reviews`
- `POST /api/bookings`
- `GET /api/bookings/student`
- `GET /api/bookings/owner`
- `PATCH /api/bookings/:booking_id/status`
- `PATCH /api/bookings/:booking_id/cancel`
=======
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
>>>>>>> 69c5178f071b6781906c8d3cb8f78ae2f9202a0f
=======
- `POST /api/auth/register/student`
- `POST /api/auth/register/owner`
- `POST /api/auth/register/provider`
- `POST /api/auth/register/admin`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `POST /api/auth/profile-picture`
- `PUT /api/auth/change-password`
- `GET /api/admin/verifications/pending`
- `PATCH /api/admin/verify/:user_type/:id`
- `GET /api/admin/users`
- `PATCH /api/admin/users/status/:role/:id`
- `POST /api/admin/universities`
- `GET /api/admin/universities`
- `GET /api/admin/reports/summary`
>>>>>>> f918e59174354a541a888ca56b5437c45559316d

---

## ðŸ”„ 5. Git Commit & Push Workflow

```bash
# Initialize or checkout branch
<<<<<<< HEAD
<<<<<<< HEAD
git checkout -b feature/dev2-accommodations-booking

# Stage your modified files
git add Backend/src/controllers/accommodationController.js
git add Backend/src/controllers/bookingController.js
git add Backend/src/routes/accommodationRoutes.js
git add Backend/src/routes/bookingRoutes.js
git add Frontend/src/pages/Accommodations.*
git add Frontend/src/pages/AccommodationDetails.*
git add Frontend/src/pages/OwnerDashboard.*

# Commit with semantic message
git commit -m "feat(accommodations): implement 5km proximity search, booking engine and landlord dashboard"

# Push to GitHub
git push -u origin feature/dev2-accommodations-booking
=======
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
>>>>>>> 69c5178f071b6781906c8d3cb8f78ae2f9202a0f
=======
git checkout -b feature/dev1-auth-admin-core

# Stage your modified files
git add Backend/src/controllers/authController.js
git add Backend/src/controllers/adminController.js
git add Backend/src/routes/authRoutes.js
git add Backend/src/routes/adminRoutes.js
git add Frontend/src/pages/AdminDashboard.jsx
git add Frontend/src/pages/Login.jsx Frontend/src/pages/Register.jsx

# Commit with semantic message
git commit -m "feat(auth-admin): implement IAM authentication, RBAC, and admin dashboard"

# Push to GitHub
git push -u origin feature/dev1-auth-admin-core
>>>>>>> f918e59174354a541a888ca56b5437c45559316d
```
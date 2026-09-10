<<<<<<< HEAD
# Developer 3 â€” Culinary Catering, Meal Plans & Digital Scanner Engine

Welcome to **Developer 3's** module workspace for the **UniStay** project.
=======
# Developer 1 â€” Identity, Core Platform & Administrator Console Workspace

Welcome to **Developer 1's** module workspace for the **UniStay** project.
>>>>>>> f918e59174354a541a888ca56b5437c45559316d

---

## ðŸŽ¯ 1. Role & Module Responsibilities

<<<<<<< HEAD
- **Assigned Domain**: Culinary Catering Packages, Daily Itemized Menu Catalog, 30-Day Student Meal Passes, Kitchen Dashboard & 7-Step Barcode / QR Scanner.
- **Git Feature Branch**: `feature/dev3-mealplans-daily-scanner`
- **Target Merge Base**: `main`

### Key Functional Features
1. **Meal Plans & Food Catalog**:
   - Catering packages with 5km proximity radius search from campus.
   - Itemized daily dish menu (Breakfast, Lunch, Dinner) with prices and photos.
   - Student reviews and ratings for culinary providers.
2. **Digital Meal Subscriptions**:
   - 30-day student meal package subscriptions.
   - Generation of unique Digital Meal IDs (`MEAL-XXXXXX`).
3. **Meal Provider Kitchen Dashboard**:
   - Dish & meal plan management.
   - Subscriber roster view and real-time redemption logs.
4. **The 7-Step Scanner Engine**:
   - Instant barcode/QR validation for meal redemption.
   - Verification checks: Valid card ID, provider matching, active status, non-expiration, meal type coverage, and single-redemption-per-day enforcement.
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
Developer_3_MealPlans_DailyScanner/
=======
Developer_1_Auth_Admin_Core/
>>>>>>> f918e59174354a541a888ca56b5437c45559316d
â”œâ”€â”€ Backend/
â”‚   â”œâ”€â”€ package.json
â”‚   â”œâ”€â”€ .env
â”‚   â””â”€â”€ src/
<<<<<<< HEAD
â”‚       â”œâ”€â”€ server.js                          # Configured to mount meal plan & scanner routes
â”‚       â”œâ”€â”€ utils/mealIdGenerator.js           # Unique MEAL-XXXXXX generator
â”‚       â”œâ”€â”€ controllers/
â”‚       â”‚   â”œâ”€â”€ mealPlanController.js          # Meal plans, dish items catalog, reviews
â”‚       â”‚   â”œâ”€â”€ subscriptionController.js      # 30-day meal pass subscriptions
â”‚       â”‚   â””â”€â”€ mealConsumptionController.js   # 7-step barcode redemption scanner
â”‚       â””â”€â”€ routes/
â”‚           â”œâ”€â”€ mealPlanRoutes.js              # /api/meal-plans
â”‚           â”œâ”€â”€ subscriptionRoutes.js          # /api/subscriptions
â”‚           â””â”€â”€ mealConsumptionRoutes.js       # /api/meal-consumption
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
        â”œâ”€â”€ App.jsx                            # Dev 3 routes & meal plans catalog
        â”œâ”€â”€ pages/
        â”‚   â”œâ”€â”€ MealPlans.jsx & .css           # Catering plans & campus search
        â”‚   â”œâ”€â”€ MealPlanDetails.jsx & .css     # Menu items & subscription checkout
        â”‚   â””â”€â”€ ProviderDashboard.jsx & .css   # Kitchen scanner & order fulfillment
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
# Runs on http://localhost:5173 (Directs to /meal-plans)
=======
# Runs on http://localhost:5173
>>>>>>> f918e59174354a541a888ca56b5437c45559316d
```

---

## ðŸ“¡ 4. Endpoints Owned
<<<<<<< HEAD
- `GET /api/meal-plans`
- `GET /api/meal-plans/:id`
- `GET /api/meal-plans/provider/my-plans`
- `POST /api/meal-plans`
- `POST /api/meal-plans/food-item`
- `DELETE /api/meal-plans/food-item/:foodId`
- `DELETE /api/meal-plans/:id`
- `POST /api/meal-plans/:id/reviews`
- `POST /api/subscriptions`
- `GET /api/subscriptions/student`
- `GET /api/subscriptions/provider`
- `PATCH /api/subscriptions/:id/cancel`
- `POST /api/meal-consumption/scan`
- `GET /api/meal-consumption/logs`
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
git checkout -b feature/dev3-mealplans-daily-scanner

# Stage your modified files
git add Backend/src/controllers/mealPlanController.js
git add Backend/src/controllers/subscriptionController.js
git add Backend/src/controllers/mealConsumptionController.js
git add Backend/src/routes/mealPlanRoutes.js
git add Backend/src/routes/subscriptionRoutes.js
git add Backend/src/routes/mealConsumptionRoutes.js
git add Backend/src/utils/mealIdGenerator.js
git add Frontend/src/pages/MealPlans.*
git add Frontend/src/pages/MealPlanDetails.*
git add Frontend/src/pages/ProviderDashboard.*

# Commit with semantic message
git commit -m "feat(catering): implement meal packages, digital subscriptions and 7-step QR scanner"

# Push to GitHub
git push -u origin feature/dev3-mealplans-daily-scanner
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
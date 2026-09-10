# Developer 3 â€” Culinary Catering, Meal Plans & Digital Scanner Engine

Welcome to **Developer 3's** module workspace for the **UniStay** project.

---

## ðŸŽ¯ 1. Role & Module Responsibilities

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

---

## ðŸ“‚ 2. File & Directory Ownership

```
Developer_3_MealPlans_DailyScanner/
â”œâ”€â”€ Backend/
â”‚   â”œâ”€â”€ package.json
â”‚   â”œâ”€â”€ .env
â”‚   â””â”€â”€ src/
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
â”‚
â””â”€â”€ Frontend/
    â”œâ”€â”€ package.json
    â”œâ”€â”€ vite.config.js
    â””â”€â”€ src/
        â”œâ”€â”€ App.jsx                            # Dev 3 routes & meal plans catalog
        â”œâ”€â”€ pages/
        â”‚   â”œâ”€â”€ MealPlans.jsx & .css           # Catering plans & campus search
        â”‚   â”œâ”€â”€ MealPlanDetails.jsx & .css     # Menu items & subscription checkout
        â”‚   â””â”€â”€ ProviderDashboard.jsx & .css   # Kitchen scanner & order fulfillment
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
# Runs on http://localhost:5173 (Directs to /meal-plans)
```

---

## ðŸ“¡ 4. Endpoints Owned
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

---

## ðŸ”„ 5. Git Commit & Push Workflow

```bash
# Initialize or checkout branch
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
```
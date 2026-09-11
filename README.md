## 1.Create Database Manually in PostgreSQL (PgAdmin)
CREATE DATABASE IF NOT EXISTS unistay_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
# run this quary in PgAdmin to Create Database

## 2. Database Tables creation 
#Run the SQL file (schema.sql) in the Path UniStay\Backend\src\db\schema.sql
#import the schema.sql file in PgAdmin and Execute the Script to Create All the Tables 

## 3. Setting up the Environment
#create .env file inside path UniStay\Backend\ and set values for the following variables
```bash
PORT=5000
NODE_ENV=development

#PostgreSQL Connection Credentials
PG_USER=postgres
PG_HOST=localhost
PG_DATABASE=unistay_db
PG_PASSWORD=<enter_your_postgres_password>
PG_PORT=5432

#Authentication
JWT_SECRET=<secret_key>
JWT_EXPIRES_IN=7d

#Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<cloud_secret_key>
CLOUDINARY_URL=<cloud_url>

#Google Maps API Key
GOOGLE_MAPS_API_KEY=<map_api_key>
```

#create .env file inside path UniStay\Frontend\ and set value for the following variable
```bash
VITE_GOOGLE_MAPS_API_KEY=<map_api_key>
```
## 4. How to Run Locally

### Start Backend
```bash
cd Backend
npm install
npm run dev
# Runs on http://localhost:5000 (API Health: http://localhost:5000/api/health)
```

### Start Frontend
```bash
cd Frontend
npm install
npm run dev
```

## 5. Admin Credentials
Email: admin@unistay.lk
password: Admin@12345


## 6. API Endpoints

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

---

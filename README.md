# Developer 2 â€” Accommodations, Housing Discovery & Landlord Operations

Welcome to **Developer 2's** module workspace for the **UniStay** project.

---

## ðŸŽ¯ 1. Role & Module Responsibilities

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

---

## ðŸ“‚ 2. File & Directory Ownership

```
Developer_2_Accommodations_Booking/
â”œâ”€â”€ Backend/
â”‚   â”œâ”€â”€ package.json
â”‚   â”œâ”€â”€ .env
â”‚   â””â”€â”€ src/
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
â”‚
â””â”€â”€ Frontend/
    â”œâ”€â”€ package.json
    â”œâ”€â”€ vite.config.js
    â””â”€â”€ src/
        â”œâ”€â”€ App.jsx                            # Dev 2 routes & accommodations landing
        â”œâ”€â”€ pages/
        â”‚   â”œâ”€â”€ Accommodations.jsx & .css      # Search & 5km radius listings
        â”‚   â”œâ”€â”€ AccommodationDetails.jsx & .css# Listing details, gallery & booking form
        â”‚   â””â”€â”€ OwnerDashboard.jsx & .css      # Landlord portal & booking management
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
# Runs on http://localhost:5173 (Directs to /accommodations)
```

---

## ðŸ“¡ 4. Endpoints Owned
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

---

## ðŸ”„ 5. Git Commit & Push Workflow

```bash
# Initialize or checkout branch
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
```
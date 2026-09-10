CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE booking_status_enum AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE subscription_status_enum AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE order_status_enum AS ENUM ('pending', 'Ready To Pick up', 'Confirmed', 'cancelled');

-- ==========================================
-- 3. USER & ROLE ENTITY TABLES
-- ==========================================

-- A. Student Table
CREATE TABLE STUDENT (
    student_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    street VARCHAR(100),
    city VARCHAR(50),
    postal_code VARCHAR(10),
    university_name VARCHAR(100) NOT NULL,
    student_id_number VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- B. Property Owner Table
CREATE TABLE PROPERTY_OWNER (
    owner_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    street VARCHAR(100),
    city VARCHAR(50),
    postal_code VARCHAR(10),
    verification_status verification_status_enum DEFAULT 'pending',
    verified_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- C. Meal Provider Table
CREATE TABLE MEAL_PROVIDER (
    provider_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    street VARCHAR(100),
    city VARCHAR(50),
    postal_code VARCHAR(10),
    business_name VARCHAR(100) NOT NULL,
    verification_status verification_status_enum DEFAULT 'pending',
    is_active BOOLEAN DEFAULT true,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- D. System Admin Table
CREATE TABLE ADMIN (
    admin_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    access_level VARCHAR(20) DEFAULT 'superadmin'
);

-- ==========================================
-- 4. ACADEMIC & ACCOMMODATION DOMAIN
-- ==========================================

-- A. University Campus Master Table
CREATE TABLE UNIVERSITY (
    university_id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    city VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- B. Accommodation Listings Table
CREATE TABLE ACCOMMODATION (
    accommodation_id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES PROPERTY_OWNER(owner_id) ON DELETE CASCADE,
    university_id INT REFERENCES UNIVERSITY(university_id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    street VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    price_per_month DECIMAL(10, 2) NOT NULL,
    room_type VARCHAR(50) DEFAULT 'Single',
    total_rooms INT DEFAULT 1,
    ac_status BOOLEAN DEFAULT false,
    rules_and_facilities TEXT,
    image_url TEXT,
    image_urls TEXT[],
    availability_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- C. Accommodation Bookings Table
CREATE TABLE BOOKING (
    booking_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES STUDENT(student_id) ON DELETE CASCADE,
    accommodation_id INT REFERENCES ACCOMMODATION(accommodation_id) ON DELETE CASCADE,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_in_date DATE NOT NULL,
    check_out_date DATE,
    status booking_status_enum DEFAULT 'pending'
);

-- D. Accommodation Student Reviews Table
CREATE TABLE REVIEW (
    review_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES STUDENT(student_id) ON DELETE CASCADE,
    accommodation_id INT REFERENCES ACCOMMODATION(accommodation_id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. CATERING, MEAL PLANS & VOUCHERS
-- ==========================================

-- A. Meal Plan Packages Table
CREATE TABLE MEAL_PLAN (
    meal_plan_id SERIAL PRIMARY KEY,
    provider_id INT REFERENCES MEAL_PROVIDER(provider_id) ON DELETE CASCADE,
    university_id INT REFERENCES UNIVERSITY(university_id) ON DELETE SET NULL,
    plan_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    address VARCHAR(200),
    city VARCHAR(50),
    phone_number VARCHAR(15),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- B. Meal Plan Service Types Mapping
CREATE TABLE MEAL_TYPE (
    meal_plan_id INT REFERENCES MEAL_PLAN(meal_plan_id) ON DELETE CASCADE,
    meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
    PRIMARY KEY (meal_plan_id, meal_type)
);

-- C. Individual Food Items Table
CREATE TABLE FOOD_ITEM (
    food_id SERIAL PRIMARY KEY,
    meal_plan_id INT REFERENCES MEAL_PLAN(meal_plan_id) ON DELETE CASCADE,
    provider_id INT REFERENCES MEAL_PROVIDER(provider_id) ON DELETE CASCADE,
    food_name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(20) CHECK (category IN ('Breakfast', 'Lunch', 'Dinner')),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- D. Digital Meal Card Subscriptions Table
CREATE TABLE SUBSCRIPTION (
    subscription_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES STUDENT(student_id) ON DELETE CASCADE,
    meal_plan_id INT REFERENCES MEAL_PLAN(meal_plan_id) ON DELETE CASCADE,
    subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE NOT NULL,
    meal_id VARCHAR(50) UNIQUE NOT NULL,
    status subscription_status_enum DEFAULT 'active'
);

-- E. Daily Meal Redemption Record Logs
CREATE TABLE MEAL_CONSUMPTION_RECORD (
    record_id SERIAL PRIMARY KEY,
    subscription_id INT REFERENCES SUBSCRIPTION(subscription_id) ON DELETE CASCADE,
    provider_id INT REFERENCES MEAL_PROVIDER(provider_id) ON DELETE CASCADE,
    consumption_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    meal_type_consumed VARCHAR(20) NOT NULL
);

-- F. Student Digital Food Vouchers
CREATE TABLE FOOD_VOUCHER (
    voucher_id SERIAL PRIMARY KEY,
    voucher_code VARCHAR(50) UNIQUE NOT NULL,
    student_id INT REFERENCES STUDENT(student_id) ON DELETE CASCADE,
    tier_name VARCHAR(30) NOT NULL, -- 'Basic', 'Standard', 'Premium'
    initial_balance DECIMAL(10, 2) NOT NULL,
    remaining_balance DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- G. Food Orders Table
CREATE TABLE FOOD_ORDER (
    order_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES STUDENT(student_id) ON DELETE CASCADE,
    meal_plan_id INT REFERENCES MEAL_PLAN(meal_plan_id) ON DELETE CASCADE,
    provider_id INT REFERENCES MEAL_PROVIDER(provider_id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status order_status_enum DEFAULT 'pending',
    voucher_code_used VARCHAR(50),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- H. Order Line Items Table
CREATE TABLE ORDER_ITEM (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES FOOD_ORDER(order_id) ON DELETE CASCADE,
    food_id INT REFERENCES FOOD_ITEM(food_id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL
);

-- I. Meal Plan Reviews Table
CREATE TABLE MEAL_REVIEW (
    review_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES STUDENT(student_id) ON DELETE CASCADE,
    meal_plan_id INT REFERENCES MEAL_PLAN(meal_plan_id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. FINANCE, WALLETS & PAYMENTS
-- ==========================================

-- A. Unified Platform Payment Transactions
CREATE TABLE PAYMENT (
    payment_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    user_role VARCHAR(20) NOT NULL, -- 'student'
    payment_type VARCHAR(30) NOT NULL, -- 'accommodation_rent' OR 'meal_subscription'
    reference_id INT NOT NULL, -- accommodation_id OR meal_plan_id
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Demo Credit Card',
    transaction_status VARCHAR(20) DEFAULT 'completed',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- B. Provider Revenue Wallets Table
CREATE TABLE PROVIDER_WALLET (
    wallet_id SERIAL PRIMARY KEY,
    provider_id INT UNIQUE REFERENCES MEAL_PROVIDER(provider_id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- C. Provider Bank Withdrawal Log Table
CREATE TABLE WITHDRAWAL_REQUEST (
    withdrawal_id SERIAL PRIMARY KEY,
    provider_id INT REFERENCES MEAL_PROVIDER(provider_id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    account_holder_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 7. SUPPORT, INQUIRIES & NOTIFICATIONS
-- ==========================================

-- A. Support Inquiries Table
CREATE TABLE inquiries (
    inquiry_id SERIAL PRIMARY KEY,
    user_id INT NULL, -- NULL if submitted by guest
    user_role VARCHAR(50) DEFAULT 'guest',
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    admin_response TEXT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'responded'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- B. User System Notifications Table
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    user_role VARCHAR(50) NOT NULL, -- 'student', 'property_owner', 'meal_provider'
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
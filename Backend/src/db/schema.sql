-- PostgreSQL Schema for UniStay Database

-- 1. Custom Enum Types
CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE booking_status_enum AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE subscription_status_enum AS ENUM ('active', 'expired', 'cancelled');

-- 2. Standalone Role Tables
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
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ADMIN (
    admin_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    access_level VARCHAR(20) DEFAULT 'superadmin'
);

-- 3. Core Business Domain Tables
CREATE TABLE ACCOMMODATION (
    accommodation_id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES PROPERTY_OWNER(owner_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    street VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    price_per_month DECIMAL(10, 2) NOT NULL,
    availability_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE BOOKING (
    booking_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES STUDENT(student_id) ON DELETE CASCADE,
    accommodation_id INT REFERENCES ACCOMMODATION(accommodation_id) ON DELETE CASCADE,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_in_date DATE NOT NULL,
    check_out_date DATE,
    status booking_status_enum DEFAULT 'pending'
);

CREATE TABLE MEAL_PLAN (
    meal_plan_id SERIAL PRIMARY KEY,
    provider_id INT REFERENCES MEAL_PROVIDER(provider_id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MEAL_TYPE (
    meal_plan_id INT REFERENCES MEAL_PLAN(meal_plan_id) ON DELETE CASCADE,
    meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
    PRIMARY KEY (meal_plan_id, meal_type)
);

CREATE TABLE SUBSCRIPTION (
    subscription_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES STUDENT(student_id) ON DELETE CASCADE,
    meal_plan_id INT REFERENCES MEAL_PLAN(meal_plan_id) ON DELETE CASCADE,
    subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE NOT NULL,
    meal_id VARCHAR(50) UNIQUE NOT NULL,
    status subscription_status_enum DEFAULT 'active'
);

CREATE TABLE MEAL_CONSUMPTION_RECORD (
    record_id SERIAL PRIMARY KEY,
    subscription_id INT REFERENCES SUBSCRIPTION(subscription_id) ON DELETE CASCADE,
    provider_id INT REFERENCES MEAL_PROVIDER(provider_id) ON DELETE CASCADE,
    consumption_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    meal_type_consumed VARCHAR(20) NOT NULL
);
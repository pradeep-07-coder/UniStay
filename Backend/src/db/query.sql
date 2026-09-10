-- UniStay Database Alterations & Updates
-- Run these queries on unistay_db

-- 1. Add image_url and make price optional (default 0) for MEAL_PLAN
ALTER TABLE MEAL_PLAN ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE MEAL_PLAN ALTER COLUMN price DROP NOT NULL;
ALTER TABLE MEAL_PLAN ALTER COLUMN price SET DEFAULT 0;

-- 2. Add profile_image column to all user tables
ALTER TABLE STUDENT ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE PROPERTY_OWNER ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE MEAL_PROVIDER ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE ADMIN ADD COLUMN IF NOT EXISTS profile_image TEXT;

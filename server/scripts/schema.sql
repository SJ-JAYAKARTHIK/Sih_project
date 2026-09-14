-- KrishiDwaar (SIH26032) Supabase PostgreSQL Database Schema
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/fojdhgbrsvmokiljacup/sql)

-- 1. Create Enums & Types
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status_enum') THEN
        CREATE TYPE booking_status_enum AS ENUM ('ACTIVE', 'CANCELLED', 'NO_SHOW');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'arrival_status_enum') THEN
        CREATE TYPE arrival_status_enum AS ENUM ('Pending', 'Verified / Arrived');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'procurement_status_enum') THEN
        CREATE TYPE procurement_status_enum AS ENUM ('Pending', 'Completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'procurement_stage_enum') THEN
        CREATE TYPE procurement_stage_enum AS ENUM ('NOT_ARRIVED', 'WAITING', 'IN_PROGRESS', 'COMPLETED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        CREATE TYPE payment_status_enum AS ENUM ('Pending', 'Completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_source_enum') THEN
        CREATE TYPE booking_source_enum AS ENUM ('WEB', 'VOICE_IVR');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_status_enum') THEN
        CREATE TYPE complaint_status_enum AS ENUM ('Submitted', 'Under Review', 'Resolved', 'Rejected');
    END IF;
END $$;

-- 2. Create Master Crops Table
CREATE TABLE IF NOT EXISTS public.crops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rate_per_quintal NUMERIC(10, 2) NOT NULL,
    icon TEXT NOT NULL DEFAULT '🌾',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Mandis Table
CREATE TABLE IF NOT EXISTS public.mandis (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    password TEXT NOT NULL DEFAULT '123456',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Mandi Accepted Crops Junction Table
CREATE TABLE IF NOT EXISTS public.mandi_accepted_crops (
    mandi_id TEXT NOT NULL REFERENCES public.mandis(id) ON DELETE CASCADE,
    crop_id TEXT NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
    PRIMARY KEY (mandi_id, crop_id)
);

-- 5. Create Farmers Table
CREATE TABLE IF NOT EXISTS public.farmers (
    id VARCHAR(8) PRIMARY KEY CONSTRAINT farmer_id_format CHECK (id ~ '^\d{8}$'),
    name TEXT NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    password TEXT NOT NULL,
    language VARCHAR(5) NOT NULL DEFAULT 'EN',
    location TEXT NOT NULL DEFAULT 'State Agriculture Division',
    bank_details TEXT NOT NULL DEFAULT 'Bank Account **** (IFSC: SBIN0001234)',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    token_number TEXT UNIQUE NOT NULL,
    qr_payload JSONB NOT NULL,
    farmer_id VARCHAR(8) NOT NULL REFERENCES public.farmers(id) ON DELETE RESTRICT,
    farmer_name TEXT NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    mandi_id TEXT NOT NULL REFERENCES public.mandis(id) ON DELETE RESTRICT,
    mandi_name TEXT NOT NULL,
    crop_id TEXT NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
    crop_name TEXT NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    expected_qty NUMERIC(10, 2),
    actual_qty NUMERIC(10, 2),
    arrival_status arrival_status_enum NOT NULL DEFAULT 'Pending',
    procurement_status procurement_status_enum NOT NULL DEFAULT 'Pending',
    payment_status payment_status_enum NOT NULL DEFAULT 'Pending',
    booking_status booking_status_enum NOT NULL DEFAULT 'ACTIVE',
    procurement_stage procurement_stage_enum NOT NULL DEFAULT 'NOT_ARRIVED',
    source booking_source_enum NOT NULL DEFAULT 'WEB',
    arrived_at TIMESTAMPTZ,
    procurement_started_at TIMESTAMPTZ,
    procurement_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Create Procurements Table
CREATE TABLE IF NOT EXISTS public.procurements (
    id TEXT PRIMARY KEY,
    booking_id TEXT UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
    token_number TEXT NOT NULL,
    farmer_id VARCHAR(8) NOT NULL REFERENCES public.farmers(id),
    farmer_name TEXT NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    mandi_id TEXT NOT NULL REFERENCES public.mandis(id),
    mandi_name TEXT NOT NULL,
    crop_name TEXT NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    expected_qty NUMERIC(10, 2),
    actual_qty NUMERIC(10, 2) NOT NULL,
    rate_per_quintal NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    billed_by TEXT NOT NULL,
    payment_ref VARCHAR(50) NOT NULL,
    payment_status payment_status_enum NOT NULL DEFAULT 'Completed',
    created_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Create Daily Reports Table
CREATE TABLE IF NOT EXISTS public.daily_reports (
    id TEXT PRIMARY KEY,
    mandi_id TEXT NOT NULL REFERENCES public.mandis(id) ON DELETE RESTRICT,
    mandi_name TEXT NOT NULL,
    date DATE NOT NULL,
    total_booked INT NOT NULL DEFAULT 0,
    total_verified INT NOT NULL DEFAULT 0,
    total_pending INT NOT NULL DEFAULT 0,
    total_completed INT NOT NULL DEFAULT 0,
    total_qty NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_payment NUMERIC(12, 2) NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_mandi_report_per_date UNIQUE (mandi_id, date)
);

-- 9. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    farmer_id VARCHAR(8) NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Create Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
    bill_id TEXT REFERENCES public.procurements(id) ON DELETE SET NULL,
    farmer_id VARCHAR(8) NOT NULL REFERENCES public.farmers(id),
    farmer_name TEXT NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    mandi_id TEXT NOT NULL REFERENCES public.mandis(id),
    mandi_name TEXT NOT NULL,
    crop_name TEXT NOT NULL,
    token_number TEXT NOT NULL,
    expected_qty NUMERIC(10, 2),
    actual_qty NUMERIC(10, 2),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    rate_per_quintal NUMERIC(10, 2),
    payment_ref VARCHAR(50),
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status complaint_status_enum NOT NULL DEFAULT 'Submitted',
    response_comment TEXT DEFAULT '',
    last_updated_by TEXT DEFAULT 'Farmer (Submitted)',
    status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_capacity_check ON public.bookings (mandi_id, date, time_slot) WHERE booking_status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_bookings_farmer_duplicate_check ON public.bookings (farmer_id, date, procurement_status) WHERE booking_status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_bookings_mandi_queue ON public.bookings (mandi_id, date, arrival_status, procurement_stage) WHERE booking_status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_bookings_farmer_history ON public.bookings (farmer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_farmer_unread ON public.notifications (farmer_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_procurements_farmer ON public.procurements (farmer_id, created_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_procurements_booking ON public.procurements (booking_id);
CREATE INDEX IF NOT EXISTS idx_complaints_mandi_filter ON public.complaints (mandi_id, status, category);
CREATE INDEX IF NOT EXISTS idx_complaints_farmer_filter ON public.complaints (farmer_id, created_at DESC);

-- 12. Enable Row-Level Security (RLS)
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandi_accepted_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- 13. Create Read-Only Public Policies for Master Tables
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public crops select policy') THEN
        CREATE POLICY "Public crops select policy" ON public.crops FOR SELECT TO anon, authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public mandis select policy') THEN
        CREATE POLICY "Public mandis select policy" ON public.mandis FOR SELECT TO anon, authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public mandi crops select policy') THEN
        CREATE POLICY "Public mandi crops select policy" ON public.mandi_accepted_crops FOR SELECT TO anon, authenticated USING (true);
    END IF;
END $$;

-- 14. Explicit Data API Table Grants for PostgREST
GRANT ALL ON TABLE public.crops TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.mandis TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.mandi_accepted_crops TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.farmers TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.bookings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.procurements TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.daily_reports TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.notifications TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.complaints TO anon, authenticated, service_role;

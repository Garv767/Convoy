-- Convoy Database Migration: Tables, Views, Domain Trigger, and Security RPC
-- Designed for shared Supabase project (snake_case compliance)

-- 1. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.commute_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_net_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    whatsapp_number TEXT,
    gender TEXT CHECK (gender IN ('female', 'male', 'other')) NOT NULL,
    department TEXT,
    year_of_study INTEGER,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Domain Enforcement Trigger on auth.users (@srmist.edu.in only)
CREATE OR REPLACE FUNCTION public.check_srmist_email()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email NOT LIKE '%@srmist.edu.in' THEN
        RAISE EXCEPTION 'Access restricted: Only @srmist.edu.in email addresses are permitted.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_srmist_domain ON auth.users;
CREATE TRIGGER enforce_srmist_domain
    BEFORE INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.check_srmist_email();

-- 3. Create Rides Table
CREATE TABLE IF NOT EXISTS public.commute_rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES public.commute_profiles(id) ON DELETE CASCADE,
    ride_category TEXT CHECK (ride_category IN ('general', 'exam')) DEFAULT 'general',
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    transport_mode TEXT CHECK (transport_mode IN ('bus', 'train', 'cab', 'private_vehicle')) NOT NULL,
    vehicle_type TEXT,
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
    fare_type TEXT CHECK (fare_type IN ('split', 'fixed', 'free')) DEFAULT 'split',
    estimated_cost_inr NUMERIC(8, 2),
    gender_preference TEXT CHECK (gender_preference IN ('any', 'female_only', 'male_only')) DEFAULT 'any',
    notes TEXT,
    status TEXT CHECK (status IN ('active', 'full', 'completed', 'cancelled')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Exam Details Table (1:1 with commute_rides when category is 'exam')
CREATE TABLE IF NOT EXISTS public.commute_exam_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID UNIQUE NOT NULL REFERENCES public.commute_rides(id) ON DELETE CASCADE,
    session TEXT CHECK (session IN ('FN', 'AN')) NOT NULL,
    venue TEXT NOT NULL, -- Flexible text field: e.g. "Tech Park 8th Floor", "UB 602"
    course_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Ride Join Requests
CREATE TABLE IF NOT EXISTS public.commute_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES public.commute_rides(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES public.commute_profiles(id) ON DELETE CASCADE,
    seats_requested INTEGER DEFAULT 1 CHECK (seats_requested > 0),
    pickup_landmark TEXT,
    message TEXT,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_passenger_per_ride UNIQUE (ride_id, passenger_id)
);

-- 6. Privacy Protection: Sanitized Public View for Feed (Zero Public PII)
CREATE OR REPLACE VIEW public.commute_public_rides AS
SELECT 
    r.id,
    r.host_id,
    r.ride_category,
    r.origin,
    r.destination,
    r.departure_date,
    r.departure_time,
    r.transport_mode,
    r.vehicle_type,
    r.total_seats,
    r.available_seats,
    r.fare_type,
    r.estimated_cost_inr,
    r.gender_preference,
    r.notes,
    r.status,
    r.created_at,
    p.gender AS host_gender,
    p.department AS host_department,
    p.year_of_study AS host_year,
    p.is_verified AS host_is_verified,
    e.session AS exam_session,
    e.venue AS exam_venue,
    e.course_code AS exam_course_code
FROM public.commute_rides r
JOIN public.commute_profiles p ON r.host_id = p.id
LEFT JOIN public.commute_exam_details e ON r.id = e.ride_id
WHERE r.status = 'active';

-- 7. Bilateral Contact Unlock RPC (Only unlocked when request is 'accepted')
CREATE OR REPLACE FUNCTION public.get_ride_contacts(target_ride_id UUID)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    phone_number TEXT,
    whatsapp_number TEXT,
    role TEXT
) SECURITY DEFINER AS $$
BEGIN
    -- Check if caller is host
    IF EXISTS (SELECT 1 FROM public.commute_rides WHERE id = target_ride_id AND host_id = auth.uid()) THEN
        RETURN QUERY
        SELECT p.id, p.full_name, p.phone_number, p.whatsapp_number, 'host'::TEXT
        FROM public.commute_profiles p WHERE p.id = auth.uid()
        UNION ALL
        SELECT p.id, p.full_name, p.phone_number, p.whatsapp_number, 'passenger'::TEXT
        FROM public.commute_requests req
        JOIN public.commute_profiles p ON req.passenger_id = p.id
        WHERE req.ride_id = target_ride_id AND req.status = 'accepted';

    -- Check if caller is accepted passenger
    ELSIF EXISTS (
        SELECT 1 FROM public.commute_requests 
        WHERE ride_id = target_ride_id AND passenger_id = auth.uid() AND status = 'accepted'
    ) THEN
        RETURN QUERY
        SELECT p.id, p.full_name, p.phone_number, p.whatsapp_number, 'host'::TEXT
        FROM public.commute_rides r
        JOIN public.commute_profiles p ON r.host_id = p.id
        WHERE r.id = target_ride_id
        UNION ALL
        SELECT p.id, p.full_name, p.phone_number, p.whatsapp_number, 'passenger'::TEXT
        FROM public.commute_profiles p WHERE p.id = auth.uid();
    ELSE
        RAISE EXCEPTION 'Access denied. You must be the host or an accepted passenger to view contact details.';
    END IF;
END;
$$ LANGUAGE plpgsql;

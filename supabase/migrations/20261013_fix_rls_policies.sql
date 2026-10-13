-- Migration: Enable RLS and define security policies for Convoy tables
-- Run this in Supabase SQL Editor to resolve "new row violates row-level security policy"

-- 1. Enable Row Level Security on all Convoy tables
ALTER TABLE public.commute_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commute_rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commute_exam_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commute_requests ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- 2. Policies for commute_profiles
-- -------------------------------------------------------------
-- Authenticated SRM students can view peer profiles
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.commute_profiles;
CREATE POLICY "Profiles viewable by authenticated users"
ON public.commute_profiles FOR SELECT
TO authenticated
USING (true);

-- Users can insert their own profile matching auth.uid()
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.commute_profiles;
CREATE POLICY "Users can insert their own profile"
ON public.commute_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can update their own profile matching auth.uid()
DROP POLICY IF EXISTS "Users can update their own profile" ON public.commute_profiles;
CREATE POLICY "Users can update their own profile"
ON public.commute_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- -------------------------------------------------------------
-- 3. Policies for commute_rides
-- -------------------------------------------------------------
-- Everyone (anon and authenticated) can browse active rides in feed
DROP POLICY IF EXISTS "Rides viewable by everyone" ON public.commute_rides;
CREATE POLICY "Rides viewable by everyone"
ON public.commute_rides FOR SELECT
USING (true);

-- Authenticated students can post their own rides
DROP POLICY IF EXISTS "Hosts can insert rides" ON public.commute_rides;
CREATE POLICY "Hosts can insert rides"
ON public.commute_rides FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = host_id);

-- Hosts can update their own rides (including status & seat updates)
DROP POLICY IF EXISTS "Hosts can update rides" ON public.commute_rides;
CREATE POLICY "Hosts can update rides"
ON public.commute_rides FOR UPDATE
TO authenticated
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id);

-- Hosts can delete their own rides
DROP POLICY IF EXISTS "Hosts can delete rides" ON public.commute_rides;
CREATE POLICY "Hosts can delete rides"
ON public.commute_rides FOR DELETE
TO authenticated
USING (auth.uid() = host_id);

-- -------------------------------------------------------------
-- 4. Policies for commute_exam_details
-- -------------------------------------------------------------
-- Exam details viewable by everyone
DROP POLICY IF EXISTS "Exam details viewable by everyone" ON public.commute_exam_details;
CREATE POLICY "Exam details viewable by everyone"
ON public.commute_exam_details FOR SELECT
USING (true);

-- Hosts can insert exam details for their rides
DROP POLICY IF EXISTS "Hosts can insert exam details" ON public.commute_exam_details;
CREATE POLICY "Hosts can insert exam details"
ON public.commute_exam_details FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM public.commute_rides WHERE id = ride_id AND host_id = auth.uid())
);

-- Hosts can update exam details for their rides
DROP POLICY IF EXISTS "Hosts can update exam details" ON public.commute_exam_details;
CREATE POLICY "Hosts can update exam details"
ON public.commute_exam_details FOR UPDATE
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.commute_rides WHERE id = ride_id AND host_id = auth.uid())
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.commute_rides WHERE id = ride_id AND host_id = auth.uid())
);

-- -------------------------------------------------------------
-- 5. Policies for commute_requests
-- -------------------------------------------------------------
-- Passengers can view their own requests; Hosts can view requests for their rides
DROP POLICY IF EXISTS "Users can view relevant requests" ON public.commute_requests;
CREATE POLICY "Users can view relevant requests"
ON public.commute_requests FOR SELECT
TO authenticated
USING (
    passenger_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.commute_rides WHERE id = ride_id AND host_id = auth.uid())
);

-- Passengers can submit join requests
DROP POLICY IF EXISTS "Passengers can submit requests" ON public.commute_requests;
CREATE POLICY "Passengers can submit requests"
ON public.commute_requests FOR INSERT
TO authenticated
WITH CHECK (
    passenger_id = auth.uid()
);

-- Hosts can accept/decline; Passengers can cancel
DROP POLICY IF EXISTS "Host or passenger can update request" ON public.commute_requests;
CREATE POLICY "Host or passenger can update request"
ON public.commute_requests FOR UPDATE
TO authenticated
USING (
    passenger_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.commute_rides WHERE id = ride_id AND host_id = auth.uid())
)
WITH CHECK (
    passenger_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.commute_rides WHERE id = ride_id AND host_id = auth.uid())
);

-- -------------------------------------------------------------
-- 6. Grant Permissions to anon & authenticated roles
-- -------------------------------------------------------------
GRANT SELECT ON public.commute_public_rides TO anon, authenticated;
GRANT SELECT ON public.commute_rides TO anon, authenticated;
GRANT SELECT ON public.commute_exam_details TO anon, authenticated;
GRANT ALL ON public.commute_profiles TO authenticated;
GRANT ALL ON public.commute_rides TO authenticated;
GRANT ALL ON public.commute_exam_details TO authenticated;
GRANT ALL ON public.commute_requests TO authenticated;

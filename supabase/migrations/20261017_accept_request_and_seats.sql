-- Migration: Atomic Ride Request Acceptance & Seat Decrement
-- 1. Update commute_public_rides view to include 'full' rides so they don't vanish from the feed / activity view
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
WHERE r.status IN ('active', 'full');

-- 2. Atomic Accept RPC with Security Definer
CREATE OR REPLACE FUNCTION public.accept_ride_request(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_req RECORD;
    v_ride RECORD;
    v_new_seats INTEGER;
    v_seats_to_deduct INTEGER;
BEGIN
    -- Fetch request
    SELECT * INTO v_req FROM public.commute_requests WHERE id = p_request_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request not found');
    END IF;

    -- Fetch ride
    SELECT * INTO v_ride FROM public.commute_rides WHERE id = v_req.ride_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Associated ride not found');
    END IF;

    -- Verify caller is the ride host
    IF v_ride.host_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only the host can accept requests');
    END IF;

    -- Check if already accepted
    IF v_req.status = 'accepted' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Already accepted', 'available_seats', v_ride.available_seats, 'ride_id', v_ride.id);
    END IF;

    -- Calculate seats to deduct (fallback to 1 if null or 0)
    v_seats_to_deduct := GREATEST(1, COALESCE(v_req.seats_requested, 1));
    v_new_seats := GREATEST(0, v_ride.available_seats - v_seats_to_deduct);

    -- 1. Update request status to accepted
    UPDATE public.commute_requests
    SET status = 'accepted',
        updated_at = NOW()
    WHERE id = p_request_id;

    -- 2. Update ride seats and status
    UPDATE public.commute_rides
    SET available_seats = v_new_seats,
        status = CASE WHEN v_new_seats = 0 THEN 'full' ELSE 'active' END,
        updated_at = NOW()
    WHERE id = v_ride.id;

    RETURN jsonb_build_object(
        'success', true,
        'available_seats', v_new_seats,
        'ride_id', v_ride.id
    );
END;
$$;

-- 3. Atomic Reject/Decline RPC with Security Definer
CREATE OR REPLACE FUNCTION public.reject_ride_request(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_req RECORD;
    v_ride RECORD;
    v_new_seats INTEGER;
    v_seats_to_restore INTEGER;
BEGIN
    -- Fetch request
    SELECT * INTO v_req FROM public.commute_requests WHERE id = p_request_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request not found');
    END IF;

    -- Fetch ride
    SELECT * INTO v_ride FROM public.commute_rides WHERE id = v_req.ride_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Associated ride not found');
    END IF;

    -- Verify caller is the ride host
    IF v_ride.host_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only the host can decline requests');
    END IF;

    -- If declining a previously accepted request, restore seats
    IF v_req.status = 'accepted' THEN
        v_seats_to_restore := GREATEST(1, COALESCE(v_req.seats_requested, 1));
        v_new_seats := LEAST(v_ride.total_seats, v_ride.available_seats + v_seats_to_restore);

        UPDATE public.commute_rides
        SET available_seats = v_new_seats,
            status = 'active',
            updated_at = NOW()
        WHERE id = v_ride.id;
    ELSE
        v_new_seats := v_ride.available_seats;
    END IF;

    -- Update request status
    UPDATE public.commute_requests
    SET status = 'rejected',
        updated_at = NOW()
    WHERE id = p_request_id;

    RETURN jsonb_build_object(
        'success', true,
        'available_seats', v_new_seats,
        'ride_id', v_ride.id
    );
END;
$$;

-- 4. Permissions
GRANT SELECT ON public.commute_public_rides TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_ride_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_ride_request(UUID) TO authenticated;

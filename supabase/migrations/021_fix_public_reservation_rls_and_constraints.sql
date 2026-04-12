DO $$
DECLARE
  rec RECORD;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'reservations'
  ) THEN
    -- Remove broken payment_status constraint variants (created mistakenly on "status").
    FOR rec IN
      SELECT c.conname, pg_get_constraintdef(c.oid) AS def
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public'
        AND t.relname = 'reservations'
        AND c.contype = 'c'
    LOOP
      IF rec.def ILIKE '%status%'
        AND rec.def ILIKE '%unpaid%'
        AND rec.def NOT ILIKE '%payment_status%'
      THEN
        EXECUTE format('ALTER TABLE public.reservations DROP CONSTRAINT %I', rec.conname);
      END IF;
    END LOOP;

    ALTER TABLE public.reservations
      ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';

    UPDATE public.reservations
    SET payment_status = 'unpaid'
    WHERE payment_status IS NULL
      OR payment_status NOT IN ('unpaid', 'partial', 'paid');

    ALTER TABLE public.reservations
      DROP CONSTRAINT IF EXISTS reservations_payment_status_check;

    ALTER TABLE public.reservations
      ADD CONSTRAINT reservations_payment_status_check
      CHECK (payment_status IN ('unpaid', 'partial', 'paid'));

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'reservations'
        AND policyname = 'reservations_public_insert_policy'
    ) THEN
      EXECUTE $policy$
        CREATE POLICY reservations_public_insert_policy
        ON public.reservations
        FOR INSERT
        TO anon, authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1
            FROM public.rooms r
            JOIN public.listings l ON l.room_id = r.id
            WHERE r.id = reservations.room_id
              AND r.building_id = reservations.building_id
              AND r.status = 'available'
              AND l.status = 'approved'
          )
        )
      $policy$;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'visit_tours'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'visit_tours'
        AND policyname = 'visit_tours_public_insert_policy'
    ) THEN
      EXECUTE $policy$
        CREATE POLICY visit_tours_public_insert_policy
        ON public.visit_tours
        FOR INSERT
        TO anon, authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1
            FROM public.rooms r
            JOIN public.listings l ON l.room_id = r.id
            WHERE r.id = visit_tours.room_id
              AND r.building_id = visit_tours.building_id
              AND r.status = 'available'
              AND l.status = 'approved'
          )
        )
      $policy$;
    END IF;
  END IF;
END
$$;

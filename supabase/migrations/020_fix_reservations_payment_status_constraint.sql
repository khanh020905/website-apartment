DO $$
DECLARE
  rec RECORD;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'reservations'
  ) THEN
    RETURN;
  END IF;

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
END
$$;

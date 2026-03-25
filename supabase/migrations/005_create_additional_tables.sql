    -- 005_create_additional_tables.sql
    -- Migration to add auxiliary tables for the rental platform
    -- Using IF NOT EXISTS to be idempotent

    -- =================
    -- BOOKINGS (Reservations)
    -- =================
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      tenant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status listing_status NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON bookings(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

    -- Enable RLS
    ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Tenants can view own bookings') THEN
            CREATE POLICY "Tenants can view own bookings" ON bookings FOR SELECT USING (auth.uid() = tenant_id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Owners can view bookings of their rooms') THEN
            CREATE POLICY "Owners can view bookings of their rooms" ON bookings FOR SELECT USING (
                EXISTS (SELECT 1 FROM rooms WHERE id = bookings.room_id AND building_id IN (SELECT id FROM buildings WHERE owner_id = auth.uid()))
            );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Tenants can insert bookings') THEN
            CREATE POLICY "Tenants can insert bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = tenant_id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Owners can update booking status') THEN
            CREATE POLICY "Owners can update booking status" ON bookings FOR UPDATE USING (
                EXISTS (SELECT 1 FROM rooms WHERE id = bookings.room_id AND building_id IN (SELECT id FROM buildings WHERE owner_id = auth.uid()))
            );
        END IF;
    END
    $$;

    -- =================
    -- FAVORITES (Saved rooms)
    -- =================
    CREATE TABLE IF NOT EXISTS favorites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, room_id)
    );

    CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_room ON favorites(room_id);

    ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'favorites' AND policyname = 'Users can view their favorites') THEN
            CREATE POLICY "Users can view their favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'favorites' AND policyname = 'Users can insert favorite') THEN
            CREATE POLICY "Users can insert favorite" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'favorites' AND policyname = 'Users can delete their favorite') THEN
            CREATE POLICY "Users can delete their favorite" ON favorites FOR DELETE USING (auth.uid() = user_id);
        END IF;
    END
    $$;

    -- =================
    -- MESSAGES (Chat between tenant and landlord)
    -- =================
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id);
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Participants can view messages') THEN
            CREATE POLICY "Participants can view messages" ON messages FOR SELECT USING (
                EXISTS (SELECT 1 FROM bookings WHERE id = messages.booking_id AND tenant_id = auth.uid())
                OR EXISTS (SELECT 1 FROM bookings b JOIN rooms r ON b.room_id = r.id JOIN buildings bl ON r.building_id = bl.id WHERE b.id = messages.booking_id AND bl.owner_id = auth.uid())
            );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Participants can insert messages') THEN
            CREATE POLICY "Participants can insert messages" ON messages FOR INSERT WITH CHECK (
                EXISTS (SELECT 1 FROM bookings WHERE id = messages.booking_id AND tenant_id = auth.uid())
                OR EXISTS (SELECT 1 FROM bookings b JOIN rooms r ON b.room_id = r.id JOIN buildings bl ON r.building_id = bl.id WHERE b.id = messages.booking_id AND bl.owner_id = auth.uid())
            );
        END IF;
    END
    $$;

    -- =================
    -- PAYMENT_TRANSACTIONS (Payments for bookings)
    -- =================
    CREATE TABLE IF NOT EXISTS payment_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      payer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      amount DECIMAL(12,0) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'VND',
      status TEXT NOT NULL CHECK (status IN ('pending','succeeded','failed','refunded')),
      provider TEXT, -- e.g., VNPay, MoMo
      transaction_ref TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_payments_booking ON payment_transactions(booking_id);
    CREATE INDEX IF NOT EXISTS idx_payments_payer ON payment_transactions(payer_id);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payment_transactions(status);

    ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_transactions' AND policyname = 'Users view own transactions') THEN
            CREATE POLICY "Users view own transactions" ON payment_transactions FOR SELECT USING (auth.uid() = payer_id);
        END IF;
    END
    $$;

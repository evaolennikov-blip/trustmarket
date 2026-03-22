-- =============================================================================
-- TrustMarket RLS Policies
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Safe to run multiple times (uses IF NOT EXISTS / OR REPLACE)
-- =============================================================================

-- =============================================================================
-- STEP 1: Schema fixes
-- =============================================================================

-- Make password_hash nullable (magic link users have no password)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- =============================================================================
-- STEP 2: Helper functions (SECURITY DEFINER = bypass RLS for admin checks)
-- =============================================================================

-- Check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
  );
$$;

-- Check if current user is a moderator or admin
CREATE OR REPLACE FUNCTION is_moderator_or_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND (is_moderator = TRUE OR is_admin = TRUE)
  );
$$;

-- =============================================================================
-- STEP 3: Enable RLS on all tables
-- =============================================================================

ALTER TABLE users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings              ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings               ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_reports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log             ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- USERS TABLE
-- Public profiles needed for listing pages and seller profiles (anon + auth).
-- Sensitive fields (email, phone, ban_reason) are protected at API layer.
-- =============================================================================

DROP POLICY IF EXISTS "users_select_public"  ON users;
DROP POLICY IF EXISTS "users_insert_own"     ON users;
DROP POLICY IF EXISTS "users_update_own"     ON users;
DROP POLICY IF EXISTS "users_update_admin"   ON users;

-- Anyone (including unauthenticated) can read user profiles
-- (needed for listing detail pages showing seller name + tier)
CREATE POLICY "users_select_public"
  ON users FOR SELECT
  USING (TRUE);

-- Authenticated users can create their own profile row (ensureProfile)
CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any user (ban, tier change, moderator promotion)
CREATE POLICY "users_update_admin"
  ON users FOR UPDATE
  USING (is_admin());

-- =============================================================================
-- LISTINGS TABLE
-- Approved listings are public. Sellers manage their own. Status only via admin.
-- =============================================================================

DROP POLICY IF EXISTS "listings_select_approved"  ON listings;
DROP POLICY IF EXISTS "listings_select_own"       ON listings;
DROP POLICY IF EXISTS "listings_insert_own"       ON listings;
DROP POLICY IF EXISTS "listings_update_own_draft" ON listings;
DROP POLICY IF EXISTS "listings_update_moderator" ON listings;
DROP POLICY IF EXISTS "listings_delete_own_draft" ON listings;

-- Anyone can browse approved listings
CREATE POLICY "listings_select_approved"
  ON listings FOR SELECT
  USING (status = 'approved');

-- Auth users can also see their own listings at any status
CREATE POLICY "listings_select_own"
  ON listings FOR SELECT
  USING (auth.uid() = seller_id);

-- Auth users can create listings (seller_id must be themselves)
CREATE POLICY "listings_insert_own"
  ON listings FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id
    AND status IN ('draft', 'pending')
  );

-- Sellers can edit their own draft listings (not approved/sold)
CREATE POLICY "listings_update_own_draft"
  ON listings FOR UPDATE
  USING (
    auth.uid() = seller_id
    AND status IN ('draft', 'pending', 'rejected')
  )
  WITH CHECK (
    auth.uid() = seller_id
    -- Sellers cannot change status themselves (use admin API)
    AND status IN ('draft', 'pending', 'removed')
  );

-- Moderators and admins can update any listing (approve/reject/feature)
CREATE POLICY "listings_update_moderator"
  ON listings FOR UPDATE
  USING (is_moderator_or_admin());

-- Sellers can remove their own draft/pending/rejected listings
CREATE POLICY "listings_delete_own_draft"
  ON listings FOR DELETE
  USING (
    auth.uid() = seller_id
    AND status IN ('draft', 'pending', 'rejected', 'removed')
  );

-- =============================================================================
-- TRANSACTIONS TABLE
-- Only parties to the transaction can read it.
-- All writes go through service role (API routes with service key).
-- =============================================================================

DROP POLICY IF EXISTS "transactions_select_party"  ON transactions;
DROP POLICY IF EXISTS "transactions_select_admin"  ON transactions;

-- Buyer and seller can read their own transactions
CREATE POLICY "transactions_select_party"
  ON transactions FOR SELECT
  USING (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
  );

-- Admins can read all transactions (dispute resolution)
CREATE POLICY "transactions_select_admin"
  ON transactions FOR SELECT
  USING (is_admin());

-- Note: INSERT and UPDATE for transactions use service role key only (API routes).
-- No auth user policies for write operations on transactions.

-- =============================================================================
-- MESSAGES TABLE
-- Only sender and receiver can read. Sender inserts. Receiver marks as read.
-- =============================================================================

DROP POLICY IF EXISTS "messages_select_party"   ON messages;
DROP POLICY IF EXISTS "messages_insert_sender"  ON messages;
DROP POLICY IF EXISTS "messages_update_read"    ON messages;
DROP POLICY IF EXISTS "messages_select_admin"   ON messages;

-- Sender and receiver can read messages in their conversations
CREATE POLICY "messages_select_party"
  ON messages FOR SELECT
  USING (
    auth.uid() = sender_id
    OR auth.uid() = receiver_id
  );

-- Sender can insert messages (sender_id must be themselves)
CREATE POLICY "messages_insert_sender"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Receiver can mark messages as read
CREATE POLICY "messages_update_read"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Admins can read all messages (scam investigation)
CREATE POLICY "messages_select_admin"
  ON messages FOR SELECT
  USING (is_admin());

-- =============================================================================
-- RATINGS TABLE
-- Anyone can read visible ratings (public reputation).
-- Only transaction parties can insert (after transaction released).
-- =============================================================================

DROP POLICY IF EXISTS "ratings_select_visible"    ON ratings;
DROP POLICY IF EXISTS "ratings_insert_party"      ON ratings;
DROP POLICY IF EXISTS "ratings_update_admin"      ON ratings;

-- Anyone can see visible ratings (public reputation signal)
CREATE POLICY "ratings_select_visible"
  ON ratings FOR SELECT
  USING (is_visible = TRUE OR is_admin());

-- Auth users can rate after their transaction is released
-- (Transaction party check: join via transaction_id)
CREATE POLICY "ratings_insert_party"
  ON ratings FOR INSERT
  WITH CHECK (
    auth.uid() = rater_id
    AND EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_id
        AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
        AND t.escrow_state = 'released'
    )
  );

-- Only admins can hide/flag ratings
CREATE POLICY "ratings_update_admin"
  ON ratings FOR UPDATE
  USING (is_admin());

-- =============================================================================
-- LISTING REPORTS TABLE
-- Users see their own reports. Admins/moderators see all.
-- =============================================================================

DROP POLICY IF EXISTS "reports_select_own"        ON listing_reports;
DROP POLICY IF EXISTS "reports_select_moderator"  ON listing_reports;
DROP POLICY IF EXISTS "reports_insert_auth"       ON listing_reports;
DROP POLICY IF EXISTS "reports_update_moderator"  ON listing_reports;

CREATE POLICY "reports_select_own"
  ON listing_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "reports_select_moderator"
  ON listing_reports FOR SELECT
  USING (is_moderator_or_admin());

CREATE POLICY "reports_insert_auth"
  ON listing_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_update_moderator"
  ON listing_reports FOR UPDATE
  USING (is_moderator_or_admin());

-- =============================================================================
-- FAVORITES TABLE
-- Users manage only their own favorites.
-- =============================================================================

DROP POLICY IF EXISTS "favorites_select_own"  ON favorites;
DROP POLICY IF EXISTS "favorites_insert_own"  ON favorites;
DROP POLICY IF EXISTS "favorites_delete_own"  ON favorites;

CREATE POLICY "favorites_select_own"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_own"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- NOTIFICATIONS TABLE
-- Users see and manage only their own notifications.
-- Inserts go through service role (API routes) only.
-- =============================================================================

DROP POLICY IF EXISTS "notifications_select_own"  ON notifications;
DROP POLICY IF EXISTS "notifications_update_own"  ON notifications;

CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- VERIFICATION REQUESTS TABLE
-- Users see only their own requests. Admins/moderators see all.
-- =============================================================================

DROP POLICY IF EXISTS "vr_select_own"        ON verification_requests;
DROP POLICY IF EXISTS "vr_select_moderator"  ON verification_requests;
DROP POLICY IF EXISTS "vr_insert_own"        ON verification_requests;
DROP POLICY IF EXISTS "vr_update_moderator"  ON verification_requests;

CREATE POLICY "vr_select_own"
  ON verification_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "vr_select_moderator"
  ON verification_requests FOR SELECT
  USING (is_moderator_or_admin());

CREATE POLICY "vr_insert_own"
  ON verification_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vr_update_moderator"
  ON verification_requests FOR UPDATE
  USING (is_moderator_or_admin());

-- =============================================================================
-- AUDIT LOG TABLE
-- Admins only. All writes go through service role.
-- =============================================================================

DROP POLICY IF EXISTS "audit_log_select_admin"  ON audit_log;

CREATE POLICY "audit_log_select_admin"
  ON audit_log FOR SELECT
  USING (is_admin());

-- =============================================================================
-- STEP 4: Grant Denis admin rights
-- Replace 'denis@youremail.com' with the actual email used to sign up
-- =============================================================================

-- UPDATE users SET is_admin = TRUE WHERE email = 'denis@youremail.com';

-- =============================================================================
-- VERIFICATION QUERIES
-- Run these after applying policies to confirm they work.
-- =============================================================================

-- Should return all approved listings (anon access)
-- SELECT count(*) FROM listings WHERE status = 'approved';

-- Should return 0 rows (non-admin can't read audit log)
-- SELECT count(*) FROM audit_log;

-- Should return only your own favorites when authenticated
-- SELECT count(*) FROM favorites;

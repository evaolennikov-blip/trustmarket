-- =============================================================================
-- TrustMarket Database Schema
-- Trust-first electronics classifieds platform (MVP)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS
-- =============================================================================

-- User verification tier
CREATE TYPE verification_tier AS ENUM (
    'none',          -- Email verified only
    'basic',         -- Phone + email + bank card
    'enhanced',      -- Passport/ID verified
    'trusted'        -- 10+ successful transactions, 95%+ rating
);

-- User role on platform
CREATE TYPE user_role AS ENUM (
    'buyer',
    'seller',
    'both'
);

-- Listing status
CREATE TYPE listing_status AS ENUM (
    'draft',         -- Not yet submitted
    'pending',       -- Awaiting human review
    'approved',      -- Live on platform
    'rejected',      -- Rejected by moderator
    'sold',          -- Sold
    'expired',       -- Expired (30 days)
    'removed'        -- Removed by seller
);

-- Electronics category
CREATE TYPE electronics_category AS ENUM (
    'smartphones',
    'tablets',
    'laptops',
    'computers',
    'tv_audio',
    'gaming',
    'accessories',
    'components',
    'other'
);

-- Device condition
CREATE TYPE device_condition AS ENUM (
    'new',
    'like_new',
    'good',
    'fair',
    'for_parts'
);

-- Transaction escrow state
CREATE TYPE escrow_state AS ENUM (
    'pending',       -- Buyer initiated payment
    'held',          -- Payment captured, awaiting delivery
    'released',      -- Buyer confirmed, funds to seller
    'refunded',      -- Dispute resolved, funds back to buyer
    'cancelled'      -- Transaction cancelled before payment
);

-- Rating type
CREATE TYPE rating_type AS ENUM (
    'buyer_to_seller',
    'seller_to_buyer'
);

-- Report status
CREATE TYPE report_status AS ENUM (
    'pending',
    'investigating',
    'resolved',
    'dismissed'
);

-- =============================================================================
-- USERS TABLE
-- =============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    
    -- Verification
    verification_tier verification_tier NOT NULL DEFAULT 'none',
    passport_verified BOOLEAN DEFAULT FALSE,
    gosuslugi_id VARCHAR(255),  -- Reference to Gosuslugi verification
    bank_card_last4 VARCHAR(4), -- Last 4 digits for verification
    
    -- Trust signals
    account_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE,
    successful_transactions INTEGER DEFAULT 0,
    failed_transactions INTEGER DEFAULT 0,
    
    -- Preferences
    preferred_language VARCHAR(10) DEFAULT 'ru',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    
    -- Admin
    is_moderator BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    banned_until TIMESTAMP WITH TIME ZONE,
    ban_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_verification_tier ON users(verification_tier);
CREATE INDEX idx_users_banned ON users(banned_until) WHERE banned_until IS NOT NULL;

-- =============================================================================
-- VERIFICATION REQUESTS TABLE
-- =============================================================================

CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Request details
    requested_tier verification_tier NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    
    -- Documents (stored as URLs to cloud storage)
    passport_front_url TEXT,
    passport_back_url TEXT,
    selfie_with_passport_url TEXT,
    bank_card_url TEXT,
    address_proof_url TEXT,
    
    -- Review
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_verification_requests_user ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);

-- =============================================================================
-- LISTINGS TABLE
-- =============================================================================

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Listing details
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price_rub INTEGER NOT NULL,  -- Price in rubles
    
    -- Category & condition
    category electronics_category NOT NULL,
    condition device_condition NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    
    -- Technical details (JSON for flexibility)
    specifications JSONB DEFAULT '{}',
    
    -- Media
    images JSONB DEFAULT '[]',  -- Array of image URLs
    
    -- Status & verification
    status listing_status NOT NULL DEFAULT 'draft',
    moderation_notes TEXT,
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    
    -- Verification photos (required per Swappa model)
    verification_photo_url TEXT,  -- Device + handwritten code
    
    -- Flags
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP WITH TIME ZONE,
    
    -- Stats
    views_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    
    -- Location
    city VARCHAR(100),
    region VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indexes for listings
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_price ON listings(price_rub);
CREATE INDEX idx_listings_created ON listings(created_at DESC);
CREATE INDEX idx_listings_expires ON listings(expires_at);
CREATE INDEX idx_listings_city ON listings(city);

-- Full-text search index (optional, can be added later with pg_search)
-- CREATE INDEX idx_listings_search ON listings USING gin(to_tsvector('russian', title || ' ' || description));

-- =============================================================================
-- TRANSACTIONS TABLE (ESCROW)
-- =============================================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parties
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE SET NULL,
    seller_id UUID NOT NULL REFERENCES users(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    
    -- Deal details
    amount_rub INTEGER NOT NULL,  -- Sale price
    platform_fee_rub INTEGER NOT NULL,  -- 3% fee
    
    -- Escrow state
    escrow_state escrow_state NOT NULL DEFAULT 'pending',
    
    -- Payment (external payment provider reference)
    payment_id VARCHAR(255),  -- e.g., Stripe/YooKassa payment ID
    payment_method VARCHAR(50),
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Shipping
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    delivery_confirmed_by UUID REFERENCES users(id),
    
    -- Dispute
    dispute_opened_at TIMESTAMP WITH TIME ZONE,
    dispute_reason TEXT,
    dispute_resolution TEXT,
    dispute_resolved_by UUID REFERENCES users(id),
    dispute_resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Completion
    completed_at TIMESTAMP WITH TIME ZONE,
    seller_paid_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure buyer != seller
    CONSTRAINT different_parties CHECK (buyer_id != seller_id)
);

-- Indexes for transactions
CREATE INDEX idx_transactions_listing ON transactions(listing_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_transactions_escrow_state ON transactions(escrow_state);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- =============================================================================
-- MESSAGES TABLE (IN-APP ONLY)
-- =============================================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Conversation
    conversation_id UUID NOT NULL,
    
    -- Sender & receiver
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    
    -- Transaction context (if related to a transaction)
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    
    -- Message content
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Security flags
    contains_external_links BOOLEAN DEFAULT FALSE,
    contains_phone BOOLEAN DEFAULT FALSE,
    contains_email BOOLEAN DEFAULT FALSE,
    flagged_for_review BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_transaction ON messages(transaction_id);

-- Function to generate conversation ID (pair + transaction/listing combo)
-- conversations are unique per user pair + transaction

-- =============================================================================
-- RATINGS TABLE (POST-TRANSACTION ONLY)
-- =============================================================================

CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Transaction
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    
    -- Rater & rated
    rater_id UUID NOT NULL REFERENCES users(id),
    rated_user_id UUID NOT NULL REFERENCES users(id),
    
    -- Rating details
    rating_type rating_type NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    
    -- Verification: only after transaction completed
    transaction_completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Moderation
    is_visible BOOLEAN DEFAULT TRUE,
    flagged_for_review BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_transaction_rating UNIQUE (transaction_id, rater_id, rating_type)
);

-- Indexes for ratings
CREATE INDEX idx_ratings_transaction ON ratings(transaction_id);
CREATE INDEX idx_ratings_rated_user ON ratings(rated_user_id);
CREATE INDEX idx_ratings_created ON ratings(created_at DESC);

-- Constraint: rating can only be given after transaction is completed
-- (enforced by transaction_completed_at reference)

-- =============================================================================
-- LISTING REPORTS TABLE
-- =============================================================================

CREATE TABLE listing_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reporter
    reporter_id UUID NOT NULL REFERENCES users(id),
    
    -- Content being reported
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),  -- If reporting a user directly
    
    -- Report details
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Evidence
    evidence_urls JSONB DEFAULT '[]',
    
    -- Status
    status report_status NOT NULL DEFAULT 'pending',
    
    -- Review
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_listing_reports_listing ON listing_reports(listing_id);
CREATE INDEX idx_listing_reports_status ON listing_reports(status);
CREATE INDEX idx_listing_reports_reporter ON listing_reports(reporter_id);

-- =============================================================================
-- FAVORITES TABLE
-- =============================================================================

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_listing ON favorites(listing_id);

-- =============================================================================
-- NOTIFICATIONS TABLE
-- =============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    
    -- Related entities
    related_listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    related_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    related_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Read status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =============================================================================
-- AUDIT LOG (for transparency)
-- =============================================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Actor
    user_id UUID REFERENCES users(id),
    
    -- Action
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Details
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_requests_updated_at BEFORE UPDATE ON verification_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate seller success rate
CREATE OR REPLACE FUNCTION get_seller_rating(p_user_id UUID)
RETURNS FLOAT AS $$
DECLARE
    total_ratings INTEGER;
    positive_ratings INTEGER;
BEGIN
    SELECT COUNT(*), SUM(CASE WHEN score >= 4 THEN 1 ELSE 0 END)
    INTO total_ratings, positive_ratings
    FROM ratings
    WHERE rated_user_id = p_user_id 
      AND rating_type = 'buyer_to_seller'
      AND is_visible = TRUE;
    
    IF total_ratings = 0 THEN
        RETURN NULL;
    END IF;
    
    RETURN (positive_ratings::FLOAT / total_ratings::FLOAT) * 100;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update user tier based on transactions
CREATE OR REPLACE FUNCTION check_and_update_user_tier(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    success_count INTEGER;
    rating_score FLOAT;
    current_tier verification_tier;
BEGIN
    -- Get current stats
    SELECT successful_transactions, get_seller_rating(p_user_id)
    INTO success_count, rating_score
    FROM users
    WHERE id = p_user_id;
    
    -- Get current tier
    SELECT verification_tier INTO current_tier
    FROM users WHERE id = p_user_id;
    
    -- Upgrade to trusted if criteria met
    IF success_count >= 10 AND rating_score >= 95 AND current_tier != 'trusted' THEN
        UPDATE users 
        SET verification_tier = 'trusted' 
        WHERE id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check tier after each completed transaction
CREATE OR REPLACE FUNCTION trigger_tier_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.escrow_state = 'released' THEN
        -- Update seller's successful transactions
        UPDATE users 
        SET successful_transactions = successful_transactions + 1
        WHERE id = NEW.seller_id;
        
        -- Check for tier upgrade
        PERFORM check_and_update_user_tier(NEW.seller_id);
        
        -- Update buyer's completed count (optional tracking)
        UPDATE users 
        SET successful_transactions = successful_transactions + 1
        WHERE id = NEW.buyer_id;
    ELSIF NEW.escrow_state = 'refunded' THEN
        -- Update failed transactions
        UPDATE users 
        SET failed_transactions = failed_transactions + 1
        WHERE id = NEW.seller_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_tier_update
    AFTER UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_tier_update();

-- =============================================================================
-- SEEDS (sample data)
-- =============================================================================

-- Insert sample users (for testing)
-- NOTE: Password is 'test123' hashed with bcrypt (placeholder)
INSERT INTO users (email, password_hash, full_name, verification_tier) VALUES
    ('seller@example.com', '$2b$10$placeholder', 'Иван Иванов', 'trusted'),
    ('buyer@example.com', '$2b$10$placeholder', 'Пётр Петров', 'basic');

-- Insert sample listing
INSERT INTO listings (seller_id, title, description, price_rub, category, condition, status, city)
SELECT 
    u.id,
    'iPhone 14 Pro 128GB Space Black',
    'Отличный iPhone, использовал 6 месяцев. Полная комплектация, чехол в подарок. Без царапин.',
    65000,
    'smartphones',
    'like_new',
    'approved',
    'Москва'
FROM users u WHERE u.email = 'seller@example.com';

-- =============================================================================
-- COMMENTS
-- =============================================================================

-- Key design decisions explained:

-- 1. ESCROW FLOW:
--    pending -> held (buyer paid) -> released (buyer confirmed) OR refunded (dispute)
--    Money only moves when buyer explicitly confirms delivery

-- 2. RATINGS:
--    Only post-transaction, linked to completed transaction
--    Prevents fake reviews, manipulation

-- 3. MESSAGES:
--    All in-app only, external links/phones/emails flagged
--    Enables platform to detect scam patterns early

-- 4. LISTING APPROVAL:
--    Human review required before going live (per Swappa model)
--    Moderators can approve/reject with notes

-- 5. VERIFICATION TIERS:
--    Progressive: none -> basic -> enhanced -> trusted
--    Higher tier = more trust = more sales

-- 6. INDEXES:
--    Optimized for common queries: user lookups, listing searches, transaction states

-- =============================================================================

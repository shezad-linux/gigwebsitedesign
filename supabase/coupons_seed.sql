-- ==============================================================================
-- Supabase Seed: Initial Launch Coupons and Sample Orders
-- ==============================================================================

INSERT INTO public.coupons (
    id, code, discount_type, discount_value, max_discount_cap, min_order_amount,
    starts_at, expires_at, max_redemptions, redemptions_count, per_user_limit,
    applicable_services, first_purchase_only, is_active, description, restriction_note
) VALUES
(
    'cpn_welcome10',
    'WELCOME10',
    'percentage',
    10.00,
    500.00,
    0.00,
    NOW() - INTERVAL '7 days',
    NOW() + INTERVAL '90 days',
    1000,
    84,
    1,
    '{}',
    TRUE,
    TRUE,
    '10% off for your first purchase.',
    'First purchase'
),
(
    'cpn_launch15',
    'LAUNCH15',
    'percentage',
    15.00,
    600.00,
    0.00,
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '30 days',
    500,
    142,
    1,
    '{}',
    FALSE,
    TRUE,
    '15% off during the limited launch period.',
    'Limited launch period'
),
(
    'cpn_student200',
    'STUDENT200',
    'fixed',
    200.00,
    NULL,
    700.00,
    NOW() - INTERVAL '14 days',
    NOW() + INTERVAL '180 days',
    2000,
    215,
    1,
    '{}',
    FALSE,
    TRUE,
    '₹200 discount for verified students.',
    'Verified students'
),
(
    'cpn_career20',
    'CAREER20',
    'percentage',
    20.00,
    1000.00,
    3000.00,
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '60 days',
    300,
    46,
    1,
    '{"career-accelerator"}',
    FALSE,
    TRUE,
    '20% off the Career Accelerator premium package.',
    'Career Accelerator only'
),
(
    'cpn_return10',
    'RETURN10',
    'percentage',
    10.00,
    400.00,
    0.00,
    NOW() - INTERVAL '10 days',
    NOW() + INTERVAL '120 days',
    800,
    39,
    2,
    '{}',
    FALSE,
    TRUE,
    '10% loyalty discount for returning customers.',
    'Eligible returning customers'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.service_orders (
    id, order_number, customer_name, customer_email, service_id, service_name,
    original_price, coupon_code, discount_amount, final_price, currency, status, created_at
) VALUES
(
    'ord_101',
    'GM-ORD-2025-0101',
    'Rohan Sharma',
    'rohan.sharma@example.com',
    'expert-resume-review',
    'Expert Resume Review',
    799.00,
    'WELCOME10',
    80.00,
    719.00,
    'INR',
    'completed',
    NOW() - INTERVAL '4 days'
),
(
    'ord_102',
    'GM-ORD-2025-0102',
    'Priya Nair',
    'priya.nair@example.com',
    'career-guidance',
    'Expert Career Guidance',
    1199.00,
    'LAUNCH15',
    180.00,
    1019.00,
    'INR',
    'completed',
    NOW() - INTERVAL '2 days'
),
(
    'ord_103',
    'GM-ORD-2025-0103',
    'Aman Verma',
    'aman.v@example.com',
    'career-accelerator',
    'Career Accelerator',
    3499.00,
    'CAREER20',
    700.00,
    2799.00,
    'INR',
    'completed',
    NOW() - INTERVAL '1 day'
),
(
    'ord_104',
    'GM-ORD-2025-0104',
    'Sneha Patel',
    'sneha.p@example.com',
    'expert-resume-creation',
    'Expert Resume Creation',
    1499.00,
    'STUDENT200',
    200.00,
    1299.00,
    'INR',
    'completed',
    NOW() - INTERVAL '12 hours'
)
ON CONFLICT (order_number) DO NOTHING;

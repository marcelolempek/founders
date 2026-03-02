-- ============================================
-- CODE6MM - 020: FIX SEEDED USERS SCHEMA ERRORS
-- ============================================

DO $$
DECLARE
    v_instance_id UUID;
BEGIN
    -- 1. Grab instance_id from a user created via the API (guaranteed correct)
    SELECT instance_id INTO v_instance_id FROM auth.users WHERE email = 'testUser_fix_123@gmail.com' LIMIT 1;
    
    -- If we didn't find the test user, fallback to common Supabase default
    IF v_instance_id IS NULL THEN
        v_instance_id := '00000000-0000-0000-0000-000000000000';
    END IF;

    -- 2. Update all seeded users with the correct instance_id and confirmation fields
    UPDATE auth.users 
    SET 
      instance_id = v_instance_id,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      last_sign_in_at = COALESCE(last_sign_in_at, NOW()),
      updated_at = NOW(),
      aud = 'authenticated',
      role = 'authenticated'
    WHERE email IN (
      'ghost@code6mm.com', 
      'soap@code6mm.com', 
      'price@code6mm.com', 
      'gaz@code6mm.com', 
      'valkyrie@code6mm.com'
    );

    -- 3. Ensure the password hash is correctly stored if it was missing
    -- We use crypt with bf (BCrypt) which is what GoTrue expects for this type of hash
    UPDATE auth.users
    SET encrypted_password = crypt('123456', gen_salt('bf'))
    WHERE email IN (
      'ghost@code6mm.com', 
      'soap@code6mm.com', 
      'price@code6mm.com', 
      'gaz@code6mm.com', 
      'valkyrie@code6mm.com'
    ) AND (encrypted_password IS NULL OR encrypted_password = '');

END $$;

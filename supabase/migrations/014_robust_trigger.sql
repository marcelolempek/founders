CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_username TEXT;
BEGIN
    -- Generate base username
    new_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        LOWER(REPLACE(split_part(NEW.email, '@', 1), '.', '_'))
    );
    
    -- Trim to max length if needed (e.g. 20 chars base) 
    -- and append random suffix to ensure uniqueness
    new_username := SUBSTR(new_username, 1, 20) || '_' || SUBSTR(md5(NEW.id::TEXT || NOW()::TEXT), 1, 5);

    INSERT INTO public.profiles (id, username, full_name, avatar_url, email)
    VALUES (
        NEW.id,
        new_username,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.email
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
        
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the transaction (allow signup)
    RAISE WARNING 'handle_new_user error: %', SQLERRM;
    RETURN NEW; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CODE6MM - 059: SECURE ADMIN DATA
-- ============================================

-- 1. Create is_admin() function for easier RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create is_moderator() function (includes admin)
CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND (role = 'admin' OR role = 'moderator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Secure Admin Logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_logs_select_admin" ON public.admin_logs;
CREATE POLICY "admin_logs_select_admin"
    ON public.admin_logs FOR SELECT
    USING (public.is_moderator());

DROP POLICY IF EXISTS "admin_logs_insert_admin" ON public.admin_logs;
CREATE POLICY "admin_logs_insert_admin"
    ON public.admin_logs FOR INSERT
    WITH CHECK (public.is_moderator());

-- 4. Secure Profiles Role Update
-- Prevent users from updating their own role to admin
-- (This should already be covered by profiles_update_own not allowing role changes if column-level security or rigid update policies are used.
-- Since Supabase typically uses full-row updates, we must ensure the policy for UPDATE prevents role hijacking).

-- We create a specific restrictive policy or trigger.
-- Trigger is safer for preventing column updates.

CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If role is changing
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        -- Only admin can change roles
        IF NOT public.is_admin() THEN
             RAISE EXCEPTION 'Only admins can change user roles';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_change ON public.profiles;
CREATE TRIGGER trg_prevent_role_change
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_role_change();

-- 5. Secure Reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
-- (Assuming policies exist, but reinforcing)
-- Standard users can INSERT
-- Standard users can SELECT their own
-- Admins/Mods can SELECT ALL, UPDATE ALL, DELETE ALL


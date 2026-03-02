-- Remove users created by the broken seed script
DELETE FROM auth.users WHERE email IN (
    'admin@code6mm.com',
    'ghost@code6mm.com',
    'soap@code6mm.com',
    'price@code6mm.com',
    'gaz@code6mm.com',
    'valkyrie@code6mm.com'
);

-- Profiles should cascade delete due to foreign key constraints

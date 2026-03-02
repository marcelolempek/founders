import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function debugLoginFinal() {
    console.log('Attempting FINAL LOGIN with ghost.operator.af@gmail.com...');

    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ghost.operator.af@gmail.com',
        password: '123456'
    });

    if (error) {
        console.error('Login Error Details:', JSON.stringify(error, null, 2));
    } else {
        console.log('--- LOGIN SUCCESS! ---');
        console.log('User ID:', data.user.id);
        console.log('Email:', data.user.email);
        console.log('Session metadata:', data.session?.access_token ? 'VALID JWT RECEIVED' : 'NO JWT');
    }
}

debugLoginFinal();

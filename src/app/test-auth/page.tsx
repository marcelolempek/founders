'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthTestPage() {
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    useEffect(() => {
        runTest();
    }, []);

    const runTest = async () => {
        addLog('Starting Auth Test (Try 3)...');

        // 1. Check Config
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        addLog(`Config: URL=${url ? 'OK' : 'MISSING'}, Key=${key ? 'OK' : 'MISSING'}`);

        // 2. Try Login (Ghost)
        addLog('Atttempting Login (ghost@Empreendedores de Cristo.com)...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'ghost@Empreendedores de Cristo.com',
            password: 'password123'
        });

        if (loginError) {
            addLog(`Login Failed: ${loginError.message}`);

            // 3. Try SignUp (Ghost)
            addLog('Attempting SignUp (ghost@Empreendedores de Cristo.com)...');
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: 'ghost@Empreendedores de Cristo.com',
                password: 'password123',
                options: {
                    data: { full_name: 'Ghost Simon', username: 'ghost_operator_v2' }
                }
            });

            if (signUpError) {
                addLog(`SignUp Failed: ${signUpError.message}`);
                // Try random email to rule out domain blocking
                const randomEmail = `test${Date.now()}@gmail.com`;
                addLog(`Attempting SignUp with Random Email (${randomEmail})...`);
                const { error: randError } = await supabase.auth.signUp({
                    email: randomEmail,
                    password: 'password123'
                });
                if (randError) addLog(`Random Email Failed: ${randError.message}`);
                else addLog('Random Email Success!');
            } else {
                addLog(`SignUp Success! User ID: ${signUpData.user?.id}`);
            }

        } else {
            addLog(`Login Success! User: ${loginData.user.email}`);
        }

        addLog('Test Complete.');
    };

    return (
        <div className="p-10 font-mono text-sm bg-gray-900 text-green-400 min-h-screen">
            <h1 className="text-xl font-bold mb-4">Auth Diagnostics V2</h1>
            <div className="flex flex-col gap-2">
                {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
        </div>
    );
}

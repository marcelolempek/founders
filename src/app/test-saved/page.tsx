'use client';

import React, { useEffect, useState } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';

export default function TestSavedPage() {
    const [logs, setLogs] = useState<string[]>([]);

    const log = (msg: string, data?: any) => {
        const text = data ? `${msg} ${JSON.stringify(data, null, 2)}` : msg;
        setLogs(prev => [...prev, text]);
    };

    useEffect(() => {
        const runTest = async () => {
            log('Starting test...');
            const user = await getCurrentUser();
            if (!user) {
                log('No user logged in.');
                return;
            }
            log('User ID:', user.id);

            // 1. Raw fetch
            const { data: rawData, error: rawError } = await supabase
                .from('saved_posts')
                .select('*')
                .eq('user_id', user.id);

            if (rawError) log('Raw fetch error:', rawError);
            else log('Raw fetch count:', rawData?.length);
            log('Raw data sample:', rawData?.[0]);

            // 2. Join fetch
            const { data: joinData, error: joinError } = await supabase
                .from('saved_posts')
                .select(`
                    id,
                    post:posts (*)
                `)
                .eq('user_id', user.id);

            if (joinError) log('Join fetch error:', joinError);
            else log('Join fetch count:', joinData?.length);
            log('Join data sample:', joinData?.[0]);

            // Check for null posts
            const nullPosts = joinData?.filter((i: any) => !i.post);
            if (nullPosts?.length) {
                log('WARNING: Found rows with NULL post (Join failed). Count:', nullPosts.length);
            }
        };

        runTest();
    }, []);

    return (
        <div className="p-10 bg-black text-green-400 font-mono text-xs whitespace-pre-wrap">
            <h1 className="text-xl mb-4">Saved Posts Debugger</h1>
            {logs.map((L, i) => <div key={i} className="mb-2 border-b border-green-900 pb-1">{L}</div>)}
        </div>
    );
}

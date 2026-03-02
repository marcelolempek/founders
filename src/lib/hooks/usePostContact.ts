import { useState } from 'react';

export interface ContactInfo {
    phone: string;
    username: string;
}

export function usePostContact() {
    const [loading, setLoading] = useState(false);

    const getContact = async (postId: string): Promise<ContactInfo> => {
        try {
            setLoading(true);
            const res = await fetch(`/api/posts/${postId}/contact`, {
                method: 'POST'
            });

            if (!res.ok) {
                if (res.status === 401) {
                    throw new Error('LOGIN_REQUIRED');
                }
                if (res.status === 429) {
                    throw new Error('RATE_LIMIT');
                }
                throw new Error('Failed to get contact');
            }

            return await res.json();
        } finally {
            setLoading(false);
        }
    };

    return { getContact, loading };
}

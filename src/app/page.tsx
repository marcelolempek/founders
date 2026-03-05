'use client';

import Feed from '@/components/screens/feed/Feed';
import LandingPage from '@/components/screens/landing/LandingPage';
import { useUser } from '@/context/UserContext';

export default function Page() {
  const { user, loading } = useUser();

  if (loading) return null;

  if (!user) {
    return <LandingPage />;
  }

  return <Feed />;
}

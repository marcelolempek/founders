import PublicProfile from '@/components/screens/profile/PublicProfile';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const resolvedParams = await params;
    return <PublicProfile userId={resolvedParams.id} />;
}

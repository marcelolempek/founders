import AdminHeader from '@/components/admin/AdminHeader';
import VerificationCard from '@/components/admin/VerificationCard';
import { adminService } from '@/services/admin';

export const dynamic = 'force-dynamic';

export default async function AdminVerificationPage() {
    const requests = await adminService.getPendingVerifications();

    return (
        <>
            <div className="hidden lg:block">
                <AdminHeader title="Verification Requests" />
            </div>
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto flex flex-col gap-6">
                    <div className="flex flex-col gap-4 pb-20">
                        {requests.length === 0 ? (
                            <div className="text-center py-20 text-slate-500">No pending verification requests.</div>
                        ) : (
                            requests.map((req) => (
                                <VerificationCard key={req.id} req={req} />
                            ))
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}

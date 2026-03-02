import AdminHeader from '@/components/admin/AdminHeader';
import UserFilters from '@/components/admin/UserFilters';
import UsersTable from '@/components/admin/UsersTable';
import AdminPagination from '@/components/admin/AdminPagination';
import { adminService } from '@/services/admin';

export const dynamic = 'force-dynamic';

interface AdminUsersPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
    const resolvedParams = await searchParams;
    const page = Number(resolvedParams?.page) || 1;
    const search = (resolvedParams?.search as string) || '';
    const filter = (resolvedParams?.filter as string) || 'all';

    const { users, total } = await adminService.getUsers(page, 20, search, filter);

    return (
        <>
            <div className="hidden lg:block">
                <AdminHeader title="User Management" />
            </div>
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-6xl mx-auto flex flex-col gap-6">
                    {/* Search & Filters */}
                    <UserFilters />

                    {/* Users Table with Bulk Actions */}
                    <UsersTable users={users} />

                    <div className="pb-20">
                        {/* Pagination */}
                        <AdminPagination total={total} limit={20} />
                    </div>
                </div>
            </main>
        </>
    );
}

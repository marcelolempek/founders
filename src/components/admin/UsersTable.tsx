'use client';

import { useState } from 'react';
import { Profile } from '@/lib/database.types';
import UserRow from './UserRow';
import UserDetailModal from './UserDetailModal';
import { adminService } from '@/services/admin';
import { toast } from '@/components/ui/Toast';

interface UsersTableProps {
    users: Profile[];
}

export default function UsersTable({ users }: UsersTableProps) {
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [viewingUserId, setViewingUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const toggleSelect = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u.id));
        }
    };

    const handleBulkBan = async () => {
        if (!confirm(`Banir ${selectedUsers.length} usuários selecionados?`)) return;
        setLoading(true);
        try {
            await adminService.bulkBanUsers(selectedUsers);
            toast.success(`${selectedUsers.length} usuários banidos.`);
            setSelectedUsers([]);
            window.location.reload(); // Simple refresh to update state
        } catch (error) {
            console.error(error);
            toast.error('Erro ao banir usuários.');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkVerify = async () => {
        if (!confirm(`Verificar ${selectedUsers.length} usuários selecionados?`)) return;
        setLoading(true);
        try {
            await adminService.bulkVerifyUsers(selectedUsers);
            toast.success(`${selectedUsers.length} usuários verificados.`);
            setSelectedUsers([]);
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao verificar usuários.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 pb-20 relative">
            {viewingUserId && <UserDetailModal userId={viewingUserId} onClose={() => setViewingUserId(null)} />}

            {/* Bulk Actions Floating Bar */}
            {selectedUsers.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-gray-700 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom duration-300">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{selectedUsers.length} selecionados</span>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <button onClick={handleBulkVerify} disabled={loading} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">verified</span> Verificar
                    </button>
                    <button onClick={handleBulkBan} disabled={loading} className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">block</span> Banir
                    </button>
                    <button onClick={() => setSelectedUsers([])} className="ml-2 p-1 text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>
            )}

            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider items-center">
                <div className="col-span-4 flex items-center gap-3">
                    <input
                        type="checkbox"
                        className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={users.length > 0 && selectedUsers.length === users.length}
                        onChange={toggleSelectAll}
                    />
                    <span>User Details</span>
                </div>
                <div className="col-span-2">Role & Status</div>
                <div className="col-span-3">Join Date</div>
                <div className="col-span-3 text-right">Actions</div>
            </div>

            {/* User Rows */}
            {users.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">search_off</span>
                    <p>No users found matching your criteria.</p>
                </div>
            ) : (
                users.map((user) => (
                    <UserRow
                        key={user.id}
                        user={user}
                        isSelected={selectedUsers.includes(user.id)}
                        onSelect={toggleSelect}
                        onViewDetails={setViewingUserId}
                    />
                ))
            )}
        </div>
    );
}

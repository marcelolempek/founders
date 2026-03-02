import AdminHeader from '@/components/admin/AdminHeader';
import StatsCard from '@/components/admin/StatsCard';
import { adminService } from '@/services/admin';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
    const stats = await adminService.getStats();
    const whatsappStats = await adminService.getWhatsAppStats();

    return (
        <>
            <div className="hidden lg:block">
                <AdminHeader title="Platform Analytics" />
            </div>
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatsCard
                            label="Total Users"
                            value={stats.totalUsers.toLocaleString()}
                            icon="group"
                        />
                        <StatsCard
                            label="Pending Reports"
                            value={stats.pendingReports.toLocaleString()}
                            icon="flag"
                            color="red"
                        />
                        <StatsCard
                            label="Verification Requests"
                            value={stats.pendingVerifications.toLocaleString()}
                            icon="verified"
                            color="blue"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* WhatsApp Engagement Chart/Table */}
                        <div className="bg-white dark:bg-[#1a202c] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm col-span-1 lg:col-span-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 mb-6">WhatsApp Engagement (Top Posts)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                    <thead className="text-xs text-slate-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-slate-300">
                                        <tr>
                                            <th className="px-4 py-3">Post Title</th>
                                            <th className="px-4 py-3">Seller</th>
                                            <th className="px-4 py-3 text-center">Total Clicks</th>
                                            <th className="px-4 py-3 text-center">Unique Users</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {whatsappStats.map((item: any) => (
                                            <tr key={item.post_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-900 truncate max-w-xs">
                                                    {item.post_title}
                                                </td>
                                                <td className="px-4 py-4">@{item.seller_username}</td>
                                                <td className="px-4 py-4 text-center font-bold text-green-600 dark:text-green-500">{item.total_clicks}</td>
                                                <td className="px-4 py-4 text-center">{item.unique_users}</td>
                                            </tr>
                                        ))}
                                        {whatsappStats.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">No WhatsApp engagement data yet</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1a202c] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 mb-6">Posts by Category (Snapshot)</h3>
                            {/* Distribution Bar Chart */}
                            <div className="flex flex-col gap-3">
                                {Object.entries(stats.postsByCategory || {}).map(([category, count]) => {
                                    // Calculate percentage relative to max or total? Relative to total.
                                    const total = Object.values(stats.postsByCategory || {}).reduce((a: number, b: number) => a + b, 0);
                                    const percentage = total > 0 ? (count as number / total) * 100 : 0;

                                    return (
                                        <div key={category} className="space-y-1">
                                            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                                                <span className="capitalize">{category}</span>
                                                <span>{count} ({percentage.toFixed(1)}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {Object.keys(stats.postsByCategory || {}).length === 0 && (
                                    <div className="text-center text-slate-400 py-10">No posts data available</div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1a202c] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 mb-6">Platform Health</h3>
                            <div className="space-y-6">
                                {/* Post Status */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Post Status Distribution</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="text-xs text-slate-500">Active Listings</div>
                                            <div className="text-xl font-bold text-green-600">{stats.postsByStatus?.['active'] || 0}</div>
                                        </div>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="text-xs text-slate-500">Sold Items</div>
                                            <div className="text-xl font-bold text-blue-600">{stats.postsByStatus?.['sold'] || 0}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* User Verification */}
                                <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">User Base Verification</h4>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-300">Verified Users</span>
                                        <span className="text-slate-500">
                                            {stats.verifiedUsers} / {stats.totalUsers} ({stats.totalUsers > 0 ? ((stats.verifiedUsers / stats.totalUsers) * 100).toFixed(1) : 0}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${stats.totalUsers > 0 ? (stats.verifiedUsers / stats.totalUsers) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

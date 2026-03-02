'use client';

export const dynamic = 'force-dynamic';

import AdminHeader from '@/components/admin/AdminHeader';
import { adminService } from '@/services/admin';
import { useEffect, useState } from 'react';
import { PlatformSettings } from '@/lib/database.types';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Partial<PlatformSettings>>({
        platform_name: '',
        support_email: '',
        maintenance_mode: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await adminService.getSettings();
            if (data) {
                setSettings(data as any);
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await adminService.updateSettings({
                platform_name: settings.platform_name,
                support_email: settings.support_email,
                maintenance_mode: settings.maintenance_mode
            });
            setMessage({ type: 'success', text: 'Settings saved successfully!' });
        } catch (error) {
            console.error('Failed to save settings', error);
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

    return (
        <>
            <div className="hidden lg:block">
                <AdminHeader title="Platform Settings" />
            </div>
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
                    <section className="bg-white dark:bg-[#1a202c] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900">General Configuration</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Basic platform information and global controls.</p>
                        </div>
                        <div className="p-6 space-y-6">
                            {message && (
                                <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Platform Name</label>
                                    <input
                                        className="w-full bg-gray-50 dark:bg-[#111621] border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-slate-900 placeholder-slate-400"
                                        type="text"
                                        value={settings.platform_name || ''}
                                        onChange={e => setSettings({ ...settings, platform_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Admin Contact Email</label>
                                    <input
                                        className="w-full bg-gray-50 dark:bg-[#111621] border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-slate-900 placeholder-slate-400"
                                        type="email"
                                        value={settings.support_email || ''}
                                        onChange={e => setSettings({ ...settings, support_email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#151b26] rounded-lg border border-gray-200 dark:border-gray-800/50">
                                <div>
                                    <p className="font-medium text-slate-700 dark:text-slate-200">Maintenance Mode</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Disables platform access for all non-admin users.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        className="sr-only peer"
                                        type="checkbox"
                                        checked={settings.maintenance_mode || false}
                                        onChange={e => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3">
                        <button className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-slate-700 dark:text-slate-300 font-medium bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Discard</button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 rounded-lg bg-blue-600 text-slate-900 text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : <><span className="material-symbols-outlined text-lg">save</span> Save Changes</>}
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}

'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminPanelInternal6() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <>
            {/*  Mobile Sidebar Overlay  */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0d1117] border-r border-gray-200 dark:border-slate-200 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-gray-200 dark:border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 border-2 border-primary/30" data-alt="Admin user profile picture" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBin0eFexg1Rhe9uowEAbPN2CxlQFAJFuCbTy1f-9y9zroeYhBfxpwe7gaFHGPKt8wJK22on-6J-F9SwjUu85vZTC-3i6chl9ayL9rXw-w-wQ7O5W06Uj12afvu0E7JRYW-QV57XokW_o2oYIPGJRCV_WbIip6JSQo_8wNfElVukffI23jU6kBM2vIjpSYighvRUT0pq8h1MCxLLPj85kXIhM0HPu9cIdpHveUa6aWz6CRyCrOvnYn_ly8ealOBmsRBn_aaVYAZc4Ys")' }}></div>
                            <div className="flex flex-col">
                                <h1 className="text-base font-bold leading-tight">Admin Console</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Moderator: Alex D.</p>
                            </div>
                        </div>
                        <button className="lg:hidden text-slate-500" onClick={() => setIsMobileMenuOpen(false)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                    <div className="px-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Moderation</div>
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>flag</span>
                        <span className="text-sm font-medium">Reported Posts</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>person_alert</span>
                        <span className="text-sm font-medium">Reported Users</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>block</span>
                        <span className="text-sm font-medium">Banned Users</span>
                    </Link>
                    <div className="px-2 mt-6 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User Management</div>
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>verified</span>
                        <span className="text-sm font-medium">Verified Badges</span>
                        <span className="ml-auto bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs py-0.5 px-2 rounded-full">8</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>group</span>
                        <span className="text-sm font-medium">All Users</span>
                    </Link>
                    <div className="px-2 mt-6 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Platform</div>
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>monitoring</span>
                        <span className="text-sm font-medium">Platform Stats</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-slate-900 group transition-colors shadow-lg shadow-primary/20" href="/" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>settings</span>
                        <span className="text-sm font-medium">Settings</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-slate-200">
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 w-full transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>logout</span>
                        <span className="text-sm font-medium">Log Out</span>
                    </button>
                </div>
            </aside>
            <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-white">
                <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-slate-900">
                            <span className="material-symbols-outlined">shield</span>
                        </div>
                        <h2 className="text-lg font-bold">Admin</h2>
                    </div>
                    <button className="text-slate-500 dark:text-slate-400" onClick={() => setIsMobileMenuOpen(true)}>
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </header>
                <header className="hidden lg:flex items-center justify-between border-b border-gray-200 dark:border-slate-200 bg-white/50 dark:bg-white/50 backdrop-blur-md px-8 py-4 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold tracking-tight">Platform Settings</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
                        <section className="bg-white dark:bg-white rounded-xl border border-gray-200 dark:border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-200 dark:border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900">General Configuration</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Basic platform information and global controls.</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Platform Name</label>
                                        <input className="w-full bg-gray-50 dark:bg-[#111621] border border-gray-200 dark:border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary dark:text-slate-900 placeholder-slate-400" type="text" defaultValue="Empreendedores de Cristo" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Admin Contact Email</label>
                                        <input className="w-full bg-gray-50 dark:bg-[#111621] border border-gray-200 dark:border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary dark:text-slate-900 placeholder-slate-400" type="email" defaultValue="admin@Empreendedores de Cristo.com" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#151b26] rounded-lg border border-gray-200 dark:border-slate-200/50">
                                    <div>
                                        <p className="font-medium text-slate-700 dark:text-slate-200">Maintenance Mode</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Disables platform access for all non-admin users.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input className="sr-only peer" type="checkbox" defaultValue="" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        </section>
                        <section className="bg-white dark:bg-white rounded-xl border border-gray-200 dark:border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-200 dark:border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900">Content Moderation</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Automated rules for feed content and user safety.</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Blacklisted Keywords</label>
                                        <span className="text-xs text-slate-500">Comma separated</span>
                                    </div>
                                    <textarea className="w-full bg-gray-50 dark:bg-[#111621] border border-gray-200 dark:border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary dark:text-slate-900 placeholder-slate-400" rows={3}>scam, fraud, illegal, real-steel, firearm, explosives</textarea>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Posts containing these words will be automatically flagged for manual review.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">Auto-hide Reported Posts</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Threshold: 5 reports</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input defaultChecked className="sr-only peer" type="checkbox" defaultValue="" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">Strict Filter Mode</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Aggressive spam detection</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input className="sr-only peer" type="checkbox" defaultValue="" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <section className="bg-white dark:bg-white rounded-xl border border-gray-200 dark:border-slate-200 overflow-hidden shadow-sm h-full">
                                <div className="p-6 border-b border-gray-200 dark:border-slate-200">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900">External Services</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                                                <span className="material-symbols-outlined">chat</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-slate-900">WhatsApp Business</p>
                                                <p className="text-xs text-green-500 font-medium flex items-center gap-1"><span className="size-1.5 rounded-full bg-green-500"></span> Active</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-medium text-slate-500 hover:text-primary transition-colors">Configure</button>
                                    </div>
                                    <hr className="border-gray-100 dark:border-slate-200/50" />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <span className="material-symbols-outlined">cloud_upload</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-slate-900">AWS S3 Storage</p>
                                                <p className="text-xs text-slate-500 font-medium">45% Quota Used</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-medium text-slate-500 hover:text-primary transition-colors">Configure</button>
                                    </div>
                                    <hr className="border-gray-100 dark:border-slate-200/50" />
                                    <div className="flex items-center justify-between opacity-60">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                                                <span className="material-symbols-outlined">payments</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-slate-900">Stripe Payments</p>
                                                <p className="text-xs text-slate-500 font-medium">Not connected</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-medium text-primary">Connect</button>
                                    </div>
                                </div>
                            </section>
                            <section className="bg-white dark:bg-white rounded-xl border border-gray-200 dark:border-slate-200 overflow-hidden shadow-sm h-full">
                                <div className="p-6 border-b border-gray-200 dark:border-slate-200">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900">User Policies</h3>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">New Registrations</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Allow new users to sign up.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input defaultChecked className="sr-only peer" type="checkbox" defaultValue="" />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">Require Email Verification</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Users must verify before posting.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input defaultChecked className="sr-only peer" type="checkbox" defaultValue="" />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">Manual Badge Approval</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Admins must review verification.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input defaultChecked className="sr-only peer" type="checkbox" defaultValue="" />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div className="fixed bottom-6 right-8 left-auto z-40 hidden lg:block">
                            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-md border border-gray-700 dark:border-white/10 p-2 rounded-xl shadow-2xl flex items-center gap-2">
                                <button className="px-6 py-2.5 rounded-lg text-slate-900 dark:text-slate-900 text-sm font-medium hover:bg-white/10 transition-colors">Discard</button>
                                <button className="px-6 py-2.5 rounded-lg bg-primary text-slate-900 text-sm font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">save</span> Save Changes
                                </button>
                            </div>
                        </div>
                        <div className="lg:hidden mt-4 flex gap-3">
                            <button className="flex-1 py-3 rounded-lg border border-gray-300 dark:border-slate-200 text-slate-700 dark:text-slate-300 font-medium">Discard</button>
                            <button className="flex-1 py-3 rounded-lg bg-primary text-slate-900 font-medium shadow-lg shadow-primary/20">Save All</button>
                        </div>
                    </div>
                </div>
            </main>


        </>
    );
}

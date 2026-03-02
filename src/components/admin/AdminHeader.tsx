'use client';

export default function AdminHeader({ title }: { title: string }) {
    return (
        <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#111621]/50 backdrop-blur-md px-8 py-4 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-900">{title}</h2>
            </div>
            <div className="flex items-center gap-6">
                <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border border-white dark:border-[#111621]"></span>
                </button>
            </div>
        </header>
    );
}

'use client';
import Link from 'next/link';
import { useNavigation } from '@/context/NavigationContext';

export function MobileNav() {
    const { openCreatePost } = useNavigation();
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0E2741]/95 backdrop-blur-md border-t border-white/10 flex justify-between items-center px-6 py-3 z-50 shadow-2xl">
            <Link href="/" className="flex flex-col items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-[24px]">home</span>
            </Link>
            <Link href="/explore" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">explore</span>
            </Link>
            <button onClick={openCreatePost} className="bg-primary text-white rounded-full p-3 -mt-8 shadow-xl shadow-primary/30 border-4 border-[#0E2741]">
                <span className="material-symbols-outlined">add</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-text-secondary/50 cursor-not-allowed" disabled title="Em breve">
                <span className="material-symbols-outlined text-[24px]">chat</span>
            </button>
            <Link href="/profile/profile" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
                <div className="size-6 rounded-full bg-cover bg-center border border-transparent hover:border-white" data-alt="User profile avatar small" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBZNyRLE_DXPpTDbpmECEnOvDHvNREa4aKmk8xAUdaktMv3iRBYlQvWbHfVyViVSrW67HjNGOnlEB90Fl93sw4778iIczCfNTDYvYjk9xkv9nNXsFNSrZlbXXDbVjsv8ePJYdslV_Pc0q31BF2manoHG0PPATpuLPvZ67o9C9WqTRNSQvzuoLbSU50bJ0aZ5WrZQ3SaJo7NmEcrSSEQwvI2IKV7eVLw4QboI28NygBk8QjZtQQkHVpyVOpSlGgAypo3g6sVEeWtknrJ")' }}></div>
            </Link>
            <Link href="/settings" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors md:hidden">
                <span className="material-symbols-outlined text-[24px]">settings</span>
            </Link>
        </nav>
    );
}

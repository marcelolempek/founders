'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full bg-[#0e2741]/80 backdrop-blur-md border-t border-white/5 py-4 mt-auto">
            <div className="container mx-auto px-4 flex flex-col  items-center justify-between gap-4">
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                    <Link className="text-xs font-medium text-slate-400 hover:text-primary transition-colors" href="/support/rules">Sobre</Link>
                    <Link className="text-xs font-medium text-slate-400 hover:text-primary transition-colors" href="/support/contact">Ajuda</Link>
                    <Link className="text-xs font-medium text-slate-400 hover:text-primary transition-colors" href="/support/rules">Segurança</Link>
                    <Link className="text-xs font-medium text-slate-400 hover:text-primary transition-colors" href="/support/rules">Privacidade</Link>
                    <Link className="text-xs font-medium text-slate-400 hover:text-primary transition-colors" href="/support/rules">Termos</Link>
                </div>

                <div className="text-xs text-slate-500 font-small">
                    © 2026 Founders • Conectando negócios e propósitos
                </div>
                <div>
                    <h4 className="text-xs text-slate-400 transition-colors">Desenvolvido por HM Technology</h4>
                </div>
            </div>
        </footer>
    );
}

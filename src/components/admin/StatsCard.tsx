interface StatsCardProps {
    label: string;
    value: string | number;
    icon: string;
    trend?: string;
    trendDirection?: 'up' | 'down' | 'neutral';
    color?: 'blue' | 'green' | 'red' | 'orange' | 'purple';
}

const COLOR_MAP = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    orange: 'text-orange-500',
    purple: 'text-purple-500',
};

const BG_MAP = {
    blue: 'bg-blue-500/10',
    green: 'bg-green-500/10',
    red: 'bg-red-500/10',
    orange: 'bg-orange-500/10',
    purple: 'bg-purple-500/10',
};

export default function StatsCard({ label, value, icon, trend, trendDirection = 'neutral', color = 'blue' }: StatsCardProps) {
    return (
        <div className="flex flex-col gap-4 rounded-xl p-5 bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</span>
                {trend ? (
                    <span className={`text-xs font-medium px-2 py-1 rounded ${trendDirection === 'up' ? 'text-green-500 bg-green-500/10' :
                            trendDirection === 'down' ? 'text-red-500 bg-red-500/10' :
                                'text-slate-500 bg-slate-500/10'
                        }`}>
                        {trend}
                    </span>
                ) : (
                    <span className={`material-symbols-outlined ${COLOR_MAP[color]}`}>{icon}</span>
                )}
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-900">{value}</p>
        </div>
    );
}

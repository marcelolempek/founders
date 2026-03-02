'use client';

import React, { useState } from 'react';

interface Tab {
    id: string;
    label: string;
    count?: number;
    icon?: string;
}

interface TabsProps {
    tabs: Tab[];
    defaultTab?: string;
    onChange?: (tabId: string) => void;
    children: React.ReactNode;
}

interface TabPanelProps {
    id: string;
    children: React.ReactNode;
}

export function Tabs({ tabs, defaultTab, onChange, children }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (onChange) onChange(tabId);
    };

    // Find the active panel from children
    const panels = React.Children.toArray(children) as React.ReactElement<TabPanelProps>[];
    const activePanel = panels.find(panel => panel.props.id === activeTab);

    return (
        <div className="flex flex-col">
            {/* Tab Headers */}
            <div className="flex border-b border-slate-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex-1 pb-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-slate-400 border-b-2 border-transparent hover:text-white'
                            }`}
                    >
                        {tab.icon && (
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                        )}
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${activeTab === tab.id
                                ? 'bg-primary/20 text-primary'
                                : 'bg-white/10 text-text-secondary'
                                }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="pt-4">
                {activePanel}
            </div>
        </div>
    );
}

export function TabPanel({ children }: TabPanelProps) {
    return <div>{children}</div>;
}

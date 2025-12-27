'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    MessageSquare,
    Share2,
    Mail,
    Settings,
    LogOut,
    Gem
} from 'lucide-react';
import clsx from 'clsx';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: MessageSquare, label: 'AI Chatbot', href: '/dashboard/chatbot' },
    { icon: Share2, label: 'Social Media', href: '/dashboard/social-media' },
    { icon: Mail, label: 'Email Marketing', href: '/dashboard/email' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 bg-[var(--color-primary)] text-[var(--color-text-main)] flex flex-col shadow-2xl z-50">
            <div className="p-6 flex items-center gap-3 border-b border-[var(--color-text-main)]/10">
                <div className="bg-[var(--color-secondary)] p-2 rounded-lg text-[var(--color-primary)]">
                    <Gem size={24} />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-tight">Vallarta Vows</h1>
                    <p className="text-xs text-[var(--color-text-main)]/60">Marketing Suite</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                        >
                            <div
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-[var(--color-text-main)]/10 text-[var(--color-text-main)] font-medium shadow-md"
                                        : "text-[var(--color-text-main)]/70 hover:bg-[var(--color-text-main)]/5 hover:text-[var(--color-text-main)]"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-[var(--color-text-main)]/5 rounded-[var(--radius-md)]"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon size={20} className={clsx(isActive ? "text-[var(--color-text-main)]" : "group-hover:text-[var(--color-text-main)]")} />
                                <span className="relative z-10">{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[var(--color-text-main)]/10">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-[var(--radius-md)] text-[var(--color-text-main)]/70 hover:bg-red-500/20 hover:text-red-700 transition-colors">
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}

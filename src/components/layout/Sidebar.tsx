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
    { icon: Share2, label: 'Marketing Content', href: '/dashboard/marketing-content' },
    { icon: Mail, label: 'Email Marketing', href: '/dashboard/email' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function Sidebar() {
    const pathname = usePathname();
    // Assuming 'isOpen' state is managed elsewhere or needs to be added for the new header structure
    // For this change, we'll assume 'isOpen' is true to display the full header content
    const isOpen = true; // Placeholder for the new header structure

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 bg-[var(--color-surface)] border-r border-[var(--color-outline)] flex flex-col z-50">
            {/* Replaced header section with the new structure */}
            <motion.div
                className={clsx(
                    'flex flex-col transition-all duration-300 relative z-50 px-6 py-5',
                    isOpen ? 'w-full' : 'w-20' // Adjusted width for the header part
                )}
                initial={false}
            >
                {/* Header - Modern Clean */}
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center shrink-0 shadow-sm text-white font-bold text-lg">
                        V
                    </div>
                    {isOpen && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-bold text-lg text-[var(--color-text-main)] tracking-tight whitespace-nowrap"
                        >
                            Vallarta Vows
                        </motion.span>
                    )}
                </div>
            </motion.div>

            {/* Navigation Items - Modern Clean Style */}
            <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] text-sm font-medium transition-all duration-200 group',
                                isActive
                                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)]'
                            )}
                        >
                            <item.icon
                                size={18}
                                className={clsx(
                                    "transition-colors",
                                    isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-light)] group-hover:text-[var(--color-text-main)]"
                                )}
                            />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-[var(--color-divider)]">
                <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-[var(--radius-lg)] text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium">
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
                <div className="mt-4 px-3 text-xs text-gray-400 font-mono">
                    v1.2 (Deployed)
                </div>
            </div>
        </aside >
    );
}

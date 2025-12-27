'use client';

import { Bell, Search, User } from 'lucide-react';

export function Header() {
    return (
        <header className="h-20 glass sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4 w-96">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search leads, campaigns..."
                        className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-[var(--color-primary)]">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900">Robin Manoogian</p>
                        <p className="text-xs text-gray-500">Admin</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-white border-2 border-white shadow-md">
                        <span className="font-medium text-sm">RM</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

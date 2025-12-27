'use client';

import { motion } from 'framer-motion';
import { Users, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

const stats = [
    { label: 'Total Leads', value: '1,284', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Conversion Rate', value: '3.4%', change: '+0.8%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Upcoming Weddings', value: '12', change: 'Next 30 Days', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' },
];

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Dashboard</h1>
                <p className="text-[var(--color-text-muted)]">Welcome back, Robin. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-[var(--radius-md)] shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm font-medium text-green-600">
                            <ArrowUpRight size={16} className="mr-1" />
                            {stat.change}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-[var(--radius-md)] shadow-sm border border-gray-100 h-96 flex items-center justify-center text-gray-400">
                    Marketing Performance Chart Placeholder
                </div>
                <div className="bg-white p-6 rounded-[var(--radius-md)] shadow-sm border border-gray-100 h-96 flex items-center justify-center text-gray-400">
                    Recent Leads List Placeholder
                </div>
            </div>
        </div>
    );
}

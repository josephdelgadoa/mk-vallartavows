'use client';

import { Mail, Plus, ArrowRight } from 'lucide-react';

const templates = [
    { title: 'Welcome Series #1', subject: 'Welcome to Paradise! 🌴', type: 'Welcome Letter', leads: 450 },
    { title: 'Follow-up Nudge', subject: 'Thinking about your big day?', type: 'Follow Up', leads: 120 },
    { title: 'Service Menu 2024', subject: 'Exclusive Wedding Packages', type: 'Brochure', leads: 890 },
];

export default function EmailPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Email Marketing</h1>
                    <p className="text-gray-500">Manage your automated flows and newsletters.</p>
                </div>
                <button className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] flex items-center gap-2 hover:bg-[var(--color-primary-light)] transition-all shadow-lg hover:shadow-xl font-medium">
                    <Plus size={20} />
                    Create New Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <div key={template.title} className="bg-white p-6 rounded-[var(--radius-md)] shadow-sm border border-gray-100 hover:border-[var(--color-secondary)] transition-all group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-secondary)] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-full bg-gray-50 text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                                <Mail size={24} />
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">{template.type}</span>
                        </div>

                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{template.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-6">Subject: {template.subject}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="text-sm text-gray-400">
                                <strong className="text-gray-900">{template.leads}</strong> recipients
                            </div>
                            <ArrowRight size={16} className="text-gray-300 group-hover:text-[var(--color-secondary)] group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

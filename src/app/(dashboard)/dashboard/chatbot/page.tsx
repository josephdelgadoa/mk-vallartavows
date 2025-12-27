'use client';

import { ChatInterface } from '@/components/ChatInterface';

export default function ChatbotPage() {
    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col justify-center">
            <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-[var(--color-text-main)] mb-2">Vallarta AI Assistant</h1>
                <p className="text-[var(--color-text-muted)]">Your personal assistant for leads, marketing, and scheduling.</p>
            </div>
            <ChatInterface />
        </div>
    );
}

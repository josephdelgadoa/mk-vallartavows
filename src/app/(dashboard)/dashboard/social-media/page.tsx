'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Facebook, Instagram, Youtube, Copy, Share2 } from 'lucide-react';

const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'tiktok', name: 'TikTok', icon: Share2, color: 'text-black', bg: 'bg-gray-100' }, // Using Share2 as proxy for TikTok
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600', bg: 'bg-red-50' },
];

export default function SocialMediaPage() {
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<string | null>(null);

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        setGeneratedContent(null);

        // Simulate AI generation
        setTimeout(() => {
            setGeneratedContent(`✨ Here is a persuasive post concept for the "${topic}" wedding theme:

Headline: "Say 'I Do' in Paradise - Where Your Dream Wedding Becomes Reality" 💍🌊

Caption:
Imagine exchanging vows as the golden sun dips below the Pacific horizon. At Vallarta Vows, we don't just plan weddings; we craft unforgettable eternal moments. From intimate beach ceremonies to grand ballroom receptions, every detail is tailored to your love story.

🌴 Authentic Local Cuisine
📸 Award-Winning Photography
🏨 Luxury Accommodations

Ready to start planning? Click the link in bio to chat with our AI wedding assistant today! #VallartaVows #DestinationWedding #MexicoWedding #LuxuryBride #LoveInParadise`);
            setIsGenerating(false);
        }, 2500);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-[var(--color-primary)]">Social Media Power Generator</h1>
                <p className="text-gray-500">Create persuasive, viral-ready content for all your channels in seconds.</p>
            </div>

            <div className="glass p-8 rounded-[var(--radius-lg)] shadow-lg space-y-6">
                <form onSubmit={handleGenerate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">What do you want to promote today?</label>
                        <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Summer Beach Wedding Package discount..."
                            className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {platforms.map((platform) => (
                            <label key={platform.id} className={`cursor-pointer border border-transparent hover:border-[var(--color-secondary)] p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${platform.bg}`}>
                                <input type="checkbox" className="hidden" defaultChecked />
                                <platform.icon className={platform.color} size={24} />
                                <span className="text-sm font-medium text-gray-700">{platform.name}</span>
                            </label>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={!topic || isGenerating}
                        className="w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white font-bold rounded-[var(--radius-md)] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <Sparkles size={20} className="animate-spin" />
                                Crafting Magic...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Generate Campaign
                            </>
                        )}
                    </button>
                </form>
            </div>

            {generatedContent && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[var(--radius-lg)] shadow-xl border border-gray-100 relative group"
                >
                    <button className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors">
                        <Copy size={20} />
                    </button>

                    <h3 className="font-bold text-lg mb-4 text-[var(--color-primary)]">Generated Content Preview</h3>
                    <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
                        {generatedContent}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

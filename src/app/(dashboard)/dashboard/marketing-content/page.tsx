'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Zap,
    Settings,
    Calendar,
    Facebook,
    Instagram,
    Youtube,
    Share2,
    Copy,
    Check,
    Lightbulb,
    UserCircle,
    Image as ImageIcon
} from 'lucide-react';
import clsx from 'clsx';

// --- Types ---
type Mode = 'autopilot' | 'manual' | 'schedule';
type Platform = 'facebook' | 'instagram' | 'reels' | 'tiktok' | 'youtube';

// --- Constants ---
const BRAND_KNOWLEDGE = {
    voice: "Heartfelt, Stress-free, Elegant, Personalized, Bilingual",
    experience: "15+ Years",
    usps: [
        "LGBTQ+ Friendly Certified",
        "A La Carte Pricing",
        "Custom Bilingual Ceremonies (English/Spanish)",
        "Concierge Services for Transportation"
    ],
    bio: "Robin Manoogian: 15+ years of creating unforgettable moments in Puerto Vallarta. Expert in navigating local vendors and creating stress-free, bespoke celebrations.",
    venues: {
        beach: "Barefoot on the Beach",
        terranoble: "Terra Noble Event Center (Panoramic Views)",
        villa: "Private Villas over Banderas Bay",
        sea: "Luxury Catamaran 'Floating Fiesta'",
        church: "Historic Catholic Church"
    }
};

const SERVICES = [
    { id: 'beach', label: 'Barefoot Beach Wedding', desc: 'Toes in the sand, ocean witness.' },
    { id: 'terranoble', label: 'Terra Noble Event Center', desc: 'Hillside panoramic views & spiritual vibe.' },
    { id: 'villa', label: 'Private Villa', desc: 'Terrace views over Banderas Bay.' },
    { id: 'sea', label: 'Wedding Party at Sea', desc: 'Luxury catamaran or yacht cruise.' },
    { id: 'church', label: 'Catholic Church Wedding', desc: 'Sacred union in a historic church.' },
    { id: 'renewal', label: 'Vow Renewal', desc: 'Reaffirming love with champagne.' },
    { id: 'elopement', label: 'Intimate Elopement', desc: 'Just the two of you + Concierge.' },
    { id: 'catering', label: 'Catering Menu', desc: 'Authentic Mexican flavors & on-site chefs.' },
    { id: 'picnic', label: 'Beach Picnic Wedding', desc: 'Relaxed, bohemian vibes on the sand.' },
];

const MUSIC_OPTIONS = [
    'Mariachi big band 10 plus musicians',
    'Trio 3 people romantic ballad music',
    'Saxophone',
    'Live Band'
];

const AUDIENCES = ['Luxury Seekers', 'Budget-Conscious', 'Adventure Enthusiasts', 'Intimate/Elopement', 'LGBTQ+ Couples'];
const TONES = ['Romantic & Heartfelt', 'Modern & Chic', 'Elegant & Timeless', 'High-Energy Party', 'Relaxed & Spiritual'];
const IMAGE_PROFILES = ['Golden Hour Glow', 'Cinematic Drama', 'Midnight Glow', 'Bright & Airy', 'Vintage Film'];

const PLATFORMS: { id: Platform; label: string; icon: any; color: string }[] = [
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { id: 'reels', label: 'Reels', icon: Instagram, color: 'text-purple-600' },
    { id: 'tiktok', label: 'TikTok', icon: Share2, color: 'text-black' },
    { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
];

export default function MarketingContentPage() {
    // --- State ---
    const [mode, setMode] = useState<Mode>('manual');
    const [selectedService, setSelectedService] = useState(SERVICES[0].id);
    const [audience, setAudience] = useState(AUDIENCES[0]);
    const [tone, setTone] = useState(TONES[0]);
    const [imageProfile, setImageProfile] = useState(IMAGE_PROFILES[0]);
    const [featureRobin, setFeatureRobin] = useState(false);
    const [music, setMusic] = useState(MUSIC_OPTIONS[0]);
    const [activePlatform, setActivePlatform] = useState<Platform>('facebook');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<Record<Platform, string> | null>(null);
    const [generatedPrompt, setGeneratedPrompt] = useState('');

    // Image Generation State
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'square' | 'portrait' | 'landscape'>('square');
    const [resolution, setResolution] = useState<'1k' | '2k' | '8k'>('1k');

    // --- Logic ---
    const applyPreset = (preset: 'luxury' | 'viral' | 'villa') => {
        setMode('manual');
        switch (preset) {
            case 'luxury':
                setSelectedService('beach');
                setAudience('Luxury Seekers');
                setTone('Romantic & Heartfelt');
                setImageProfile('Golden Hour Glow');
                break;
            case 'viral':
                setSelectedService('elopement');
                setAudience('Adventure Enthusiasts');
                setTone('High-Energy Party');
                setImageProfile('Cinematic Drama');
                break;
            case 'villa':
                setSelectedService('villa');
                setAudience('Intimate/Elopement');
                setTone('Modern & Chic');
                setImageProfile('Bright & Airy');
                break;
        }
    };

    const generateContent = async () => {
        setIsGenerating(true);
        setGeneratedContent(null);
        setGeneratedImage(null); // Reset image on new campaign
        setGeneratedPrompt('');

        try {
            const serviceLabel = SERVICES.find(s => s.id === selectedService)?.label;

            const response = await fetch('/api/marketing/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service: serviceLabel,
                    audience,
                    tone,
                    featureRobin,
                    music
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Generation failed');
            }

            const data = await response.json();

            const contentRatio: Record<Platform, string> = {
                facebook: data.facebook,
                instagram: data.instagram,
                reels: data.reels,
                tiktok: data.tiktok,
                youtube: data.youtube
            };

            setGeneratedContent(contentRatio);
            setGeneratedPrompt(data.imagePrompt);

        } catch (error: any) {
            console.error(error);
            alert(`Generation Error: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateImage = async () => {
        if (!generatedPrompt) return;

        setIsGeneratingImage(true);
        try {
            const response = await fetch('/api/marketing/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: generatedPrompt,
                    aspectRatio,
                    resolution
                })
            });

            if (!response.ok) throw new Error('Image generation failed');

            const data = await response.json();
            setGeneratedImage(data.imageUrl);

        } catch (error) {
            console.error(error);
            alert("Failed to generate image. Please checking your API key supports DALL-E 3.");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    // --- Publishing Logic ---
    const publishContent = async () => {
        if (!generatedContent || !generatedContent[activePlatform]) return;

        if (activePlatform !== 'facebook' && activePlatform !== 'instagram') {
            alert(`Direct publishing is currently only available for Facebook & Instagram.`);
            return;
        }

        const confirm = window.confirm(`Are you sure you want to publish this to ${activePlatform === 'facebook' ? 'Facebook' : 'Instagram'}?`);
        if (!confirm) return;

        setIsGenerating(true);

        try {
            let endpoint = '/api/marketing/publish/facebook';
            let body: any = {
                message: generatedContent[activePlatform],
                imageUrl: generatedImage
            };

            if (activePlatform === 'instagram') {
                endpoint = '/api/marketing/publish/instagram';
                body = {
                    caption: generatedContent[activePlatform],
                    imageUrl: generatedImage
                };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Publishing failed');
            }

            alert(`✅ Successfully Published to ${activePlatform === 'facebook' ? 'Facebook' : 'Instagram'}!\nPost ID: ${data.postId}`);

        } catch (error: any) {
            console.error(error);
            alert(`❌ Publish Failed: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-primary)]">Marketing Content Generator</h1>
                    <p className="text-[var(--color-text-muted)]">Orchestrate multi-platform campaigns with AI authority.</p>
                </div>

                {/* Presets */}
                <div className="flex gap-2">
                    <button onClick={() => applyPreset('luxury')} className="p-2 bg-white border border-gray-200 rounded-lg hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-colors" title="Luxury Beach">
                        <Lightbulb size={20} className="fill-yellow-100 text-yellow-500" />
                    </button>
                    <button onClick={() => applyPreset('viral')} className="p-2 bg-white border border-gray-200 rounded-lg hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-colors" title="Viral Strategy">
                        <Zap size={20} className="fill-purple-100 text-purple-500" />
                    </button>
                </div>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-3 gap-4 bg-white p-2 rounded-[var(--radius-lg)] border border-gray-100 shadow-sm">
                {(['autopilot', 'manual', 'schedule'] as Mode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={clsx(
                            "flex items-center justify-center gap-2 py-3 rounded-[var(--radius-md)] font-medium transition-all",
                            mode === m
                                ? "bg-[var(--color-primary)] text-white shadow-md"
                                : "text-[var(--color-text-muted)] hover:bg-gray-50"
                        )}
                    >
                        {m === 'autopilot' && <Sparkles size={18} />}
                        {m === 'manual' && <Settings size={18} />}
                        {m === 'schedule' && <Calendar size={18} />}
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                ))}
            </div>

            {mode === 'manual' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Configuration Panel */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-gray-100 space-y-5">
                            <h3 className="font-bold text-[var(--color-text-main)] flex items-center gap-2">
                                <Settings size={18} /> Configuration
                            </h3>

                            {/* Service Selector */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-text-muted)]">Wedding Service</label>
                                <select
                                    value={selectedService}
                                    onChange={(e) => setSelectedService(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-[var(--color-text-main)]"
                                >
                                    {SERVICES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                                <p className="text-xs text-[var(--color-text-muted)] bg-gray-50 p-2 rounded">
                                    {SERVICES.find(s => s.id === selectedService)?.desc}
                                </p>
                            </div>

                            {/* Audience & Tone */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-muted)]">Audience</label>
                                    <select
                                        value={audience}
                                        onChange={(e) => setAudience(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-[var(--color-text-main)] text-sm"
                                    >
                                        {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>

                                {/* Music Selector */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-muted)]">Musical Atmosphere</label>
                                    <select
                                        value={music}
                                        onChange={(e) => setMusic(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-[var(--color-text-main)]"
                                    >
                                        <option value="">No Specific Music</option>
                                        {MUSIC_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-muted)]">Tone</label>
                                    <select
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-[var(--color-text-main)] text-sm"
                                    >
                                        {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Image Profile */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-text-muted)]">Image Aesthetic</label>
                                <select
                                    value={imageProfile}
                                    onChange={(e) => setImageProfile(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-[var(--color-text-main)]"
                                >
                                    {IMAGE_PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            {/* Feature Robin Toggle */}
                            <div className="flex items-center justify-between p-3 bg-[var(--color-secondary)]/10 rounded-[var(--radius-md)] border border-[var(--color-secondary)]/20">
                                <div className="flex items-center gap-2">
                                    <UserCircle size={20} className="text-[var(--color-secondary)]" />
                                    <span className="text-sm font-bold text-[var(--color-secondary)]">Feature Robin</span>
                                </div>
                                <button
                                    onClick={() => setFeatureRobin(!featureRobin)}
                                    className={clsx(
                                        "w-12 h-6 rounded-full transition-colors relative",
                                        featureRobin ? "bg-[var(--color-secondary)]" : "bg-gray-300"
                                    )}
                                >
                                    <span className={clsx(
                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                                        featureRobin ? "left-7" : "left-1"
                                    )} />
                                </button>
                            </div>

                            <button
                                onClick={generateContent}
                                disabled={isGenerating}
                                className="w-full py-4 bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-md)] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:bg-[var(--color-primary-light)] transition-all disabled:opacity-70"
                            >
                                {isGenerating ? <Sparkles className="animate-spin" /> : <Sparkles />}
                                Generate Campaign
                            </button>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="lg:col-span-8 space-y-6">
                        {isGenerating ? (
                            <div className="h-full flex flex-col items-center justify-center bg-white rounded-[var(--radius-lg)] border border-gray-100 min-h-[500px]">
                                <Sparkles size={48} className="text-[var(--color-secondary)] animate-bounce mb-4" />
                                <h3 className="text-xl font-bold text-[var(--color-primary)]">Orchestrating Campaign...</h3>
                                <p className="text-[var(--color-text-muted)]">Analyzing audience trends and crafting visuals.</p>
                            </div>
                        ) : generatedContent ? (
                            <div className="bg-white rounded-[var(--radius-lg)] shadow-sm border border-gray-100 overflow-hidden">
                                {/* Platform Tabs */}
                                <div className="flex border-b border-gray-100">
                                    {PLATFORMS.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setActivePlatform(p.id)}
                                            className={clsx(
                                                "flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-all border-b-2",
                                                activePlatform === p.id
                                                    ? `border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-background)]`
                                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                            )}
                                        >
                                            <p.icon size={18} className={activePlatform === p.id ? p.color : "text-gray-400"} />
                                            <span className="hidden sm:inline">{p.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Content Display */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-[var(--color-text-main)]">Generated Content</label>
                                            <button className="text-xs flex items-center gap-1 text-[var(--color-secondary)] hover:underline">
                                                <Copy size={12} /> Copy
                                            </button>
                                        </div>
                                        <textarea
                                            readOnly
                                            value={generatedContent[activePlatform]}
                                            className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-[var(--radius-md)] focus:outline-none resize-none text-[var(--color-text-main)] font-sans"
                                        />
                                    </div>

                                    {/* Image Prompt Bridge & Generation */}
                                    <div className="bg-gray-900 p-4 rounded-[var(--radius-md)] text-white space-y-4">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                                                    <ImageIcon size={12} />
                                                    <span>IMAGE PROMPT (Imagen 4 Ready)</span>
                                                </div>

                                                {!generatedImage && (
                                                    <button
                                                        onClick={generateImage}
                                                        disabled={isGeneratingImage || !generatedPrompt}
                                                        className="text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white px-3 py-1.5 rounded transition-colors flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {isGeneratingImage ? <Sparkles size={12} className="animate-spin" /> : <Zap size={12} />}
                                                        {isGeneratingImage ? 'Generating...' : 'Generate Image'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Configuration Controls */}
                                            <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Aspect Ratio</label>
                                                    <div className="flex bg-gray-800 rounded p-1 gap-1">
                                                        {(['square', 'portrait', 'landscape'] as const).map(ratio => (
                                                            <button
                                                                key={ratio}
                                                                onClick={() => setAspectRatio(ratio)}
                                                                className={clsx(
                                                                    "flex-1 text-[10px] py-1 rounded transition-all capitalize",
                                                                    aspectRatio === ratio ? "bg-gray-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-300"
                                                                )}
                                                            >
                                                                {ratio}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Resolution</label>
                                                    <div className="flex bg-gray-800 rounded p-1 gap-1">
                                                        {(['1k', '2k', '8k'] as const).map(res => (
                                                            <button
                                                                key={res}
                                                                onClick={() => setResolution(res)}
                                                                className={clsx(
                                                                    "flex-1 text-[10px] py-1 rounded transition-all uppercase",
                                                                    resolution === res ? "bg-gray-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-300"
                                                                )}
                                                            >
                                                                {res}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-300 italic px-2 border-l-2 border-[var(--color-primary)]">"{generatedPrompt}"</p>

                                        {/* Generated Image Display */}
                                        {generatedImage && (
                                            <div className="relative mt-4 rounded-lg overflow-hidden border border-gray-700">
                                                <img
                                                    src={generatedImage}
                                                    alt="AI Generated Wedding Concept"
                                                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                                                    Imagen 3 • 8K
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={publishContent}
                                            disabled={isGenerating}
                                            className="flex-1 py-3 bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-light)] transition-all shadow-md disabled:opacity-70"
                                        >
                                            {isGenerating ? 'Publishing...' : `Publish to ${PLATFORMS.find(p => p.id === activePlatform)?.label}`}
                                        </button>
                                        <button className="px-6 py-3 border border-gray-200 font-medium rounded-[var(--radius-md)] hover:bg-gray-50 transition-all text-gray-600">
                                            Save Draft
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center bg-white/50 rounded-[var(--radius-lg)] border-2 border-dashed border-gray-200 min-h-[500px]">
                                <Settings size={48} className="text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-400">Configure settings to generate campaign</h3>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {mode === 'autopilot' && (
                <div className="bg-white p-12 rounded-[var(--radius-lg)] text-center shadow-sm border border-gray-100">
                    <Sparkles size={64} className="mx-auto text-[var(--color-secondary)] mb-6 animate-pulse" />
                    <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">Autopilot Mode Active</h2>
                    <p className="text-[var(--color-text-muted)] max-w-md mx-auto mb-8">
                        Gemini is analyzing seasonal trends and will automatically generate and schedule high-performing content for the week.
                    </p>
                    <button onClick={() => setMode('manual')} className="px-6 py-3 border border-gray-200 rounded-[var(--radius-md)] text-gray-600 hover:bg-gray-50">
                        Switch to Manual Control
                    </button>
                </div>
            )}

            {mode === 'schedule' && (
                <div className="bg-white p-12 rounded-[var(--radius-lg)] text-center shadow-sm border border-gray-100">
                    <Calendar size={64} className="mx-auto text-gray-300 mb-6" />
                    <h2 className="text-2xl font-bold text-gray-400 mb-4">Calendar View Coming Soon</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Drag-and-drop scheduling functionality will be available in the next update.
                    </p>
                </div>
            )}
        </div>
    );
}

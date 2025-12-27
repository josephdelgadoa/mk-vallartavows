import Link from 'next/link';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

            <div className="relative z-10 glass p-12 rounded-[var(--radius-lg)] text-center max-w-2xl shadow-2xl animate-fade-in-up">
                <h1 className="text-5xl font-bold mb-6 text-[var(--color-text-main)]">
                    Vallarta Vows
                </h1>
                <p className="text-xl mb-8 text-[var(--color-text-main)] font-medium">
                    Award-Winning AI Marketing Suite
                </p>

                <div className="flex gap-4 justify-center">
                    <Link
                        href="/login"
                        className="px-8 py-3 bg-[var(--color-primary)] text-[var(--color-text-main)] rounded-[var(--radius-md)] font-semibold hover:bg-[var(--color-primary-light)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        Access Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}

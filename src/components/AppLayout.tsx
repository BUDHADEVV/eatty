'use client';

import { MainNav } from '@/components/MainNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full flex-col md:flex-row bg-background">
            <MainNav />
            <main className="flex-1 flex flex-col p-4 md:p-6 overflow-auto">
                {children}
            </main>
        </div>
    );
}

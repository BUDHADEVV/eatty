'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';

export default function OwnerLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '2233') {
            // Very simple client-side auth for an MVP. In production, use next-auth or a real backend check.
            sessionStorage.setItem('ownerAuth', 'true');
            router.push('/owner/dashboard');
        } else {
            setError('Incorrect password');
        }
    };

    return (
        <div className="flex items-center justify-center h-full max-w-md mx-auto py-20">
            <Card className="w-full">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Owner Access</CardTitle>
                    <CardDescription>Enter the secure passcode to view analytics</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Passcode"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="text-center text-xl tracking-widest h-12"
                                autoFocus
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full h-12 text-lg" type="submit">Unlock Dashboard</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

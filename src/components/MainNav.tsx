import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Calculator, ChefHat, LayoutDashboard, Utensils } from 'lucide-react';

export function MainNav() {
    const pathname = usePathname();

    const navItems = [
        { name: 'POS (New Order)', href: '/pos', icon: Calculator },
        { name: 'Kitchen Queue', href: '/kitchen', icon: ChefHat },
        { name: 'Owner Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Menu Admin', href: '/admin/menu', icon: Utensils },
    ];

    return (
        <nav className="flex flex-col w-64 border-r bg-muted/40 min-h-screen p-4 gap-2">
            <div className="flex h-14 items-center border-b px-2 mb-4">
                <h1 className="text-xl font-bold tracking-tight">Eatya Now</h1>
            </div>
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary',
                        pathname === item.href || pathname.startsWith(item.href + '/')
                            ? 'bg-primary text-primary-foreground hover:text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted'
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                </Link>
            ))}
        </nav>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, ListOrdered, IndianRupee, Activity, LogOut, CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Order {
    id: string;
    items: {
        name: string;
        price: number;
        quantity: number;
    }[];
    totalAmount: number;
    status: string;
    token_number?: number;
    created_at: string;
}

export default function OwnerDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState<'custom' | 'monthly' | 'all'>('custom');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        // Simple auth check
        if (typeof window !== 'undefined' && sessionStorage.getItem('ownerAuth') !== 'true') {
            router.push('/owner');
            return;
        }

        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            // For MVP, we fetch all orders and filter locally to easily compute 'Monthly' vs 'Today'. 
            // In a huge DB, you'd filter via Supabase query params.
            const res = await fetch('/api/orders?limit=1000');
            const data = await res.json();
            if (Array.isArray(data)) setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('ownerAuth');
        router.push('/owner');
    };

    // Filter Logic
    const now = new Date();
    const filteredOrders = orders.filter((order) => {
        const orderDate = new Date(order.created_at);
        if (dateFilter === 'custom') {
            return orderDate.toDateString() === selectedDate.toDateString();
        }
        if (dateFilter === 'monthly') {
            return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        }
        return true; // all-time
    });

    // KPI Calculations
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrderCount = filteredOrders.length;
    const avgOrderValue = totalOrderCount > 0 ? totalRevenue / totalOrderCount : 0;

    // Top Selling Items Calculation
    const itemCounts: Record<string, number> = {};
    filteredOrders.forEach((order) => {
        order.items.forEach((item) => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
    });
    const topItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading Analytics...</div>;

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Owner Analytics</h2>
                    <p className="text-muted-foreground">Professional insights for Eatya Kattangal.</p>
                </div>
                <div className="flex items-center gap-2 bg-muted p-1 rounded-lg flex-wrap">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={dateFilter === 'custom' ? 'default' : 'ghost'}
                                className={cn(
                                    "justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                )}
                                onClick={() => setDateFilter('custom')}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                    if (date) {
                                        setSelectedDate(date);
                                        setDateFilter('custom');
                                    }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Button variant={dateFilter === 'monthly' ? 'default' : 'ghost'} size="sm" onClick={() => setDateFilter('monthly')}>
                        This Month
                    </Button>
                    <Button variant={dateFilter === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setDateFilter('all')}>
                        All Time
                    </Button>
                    <Button variant="ghost" size="icon" className="ml-2 text-destructive" onClick={handleLogout} title="Log Out">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Includes 5% GST calculated</p>
                    </CardContent>
                </Card>
                <Card className="border-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ListOrdered className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalOrderCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Successfully placed orders</p>
                    </CardContent>
                </Card>
                <Card className="border-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹{avgOrderValue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Revenue per order</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders List */}
                <Card className="lg:col-span-2 border-2">
                    <CardHeader>
                        <CardTitle>Orders ({dateFilter === 'custom' ? format(selectedDate, 'MMM d, yyyy') : dateFilter})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredOrders.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">No orders found in this period.</div>
                        ) : (
                            <div className="space-y-4">
                                {filteredOrders.slice(0, 15).map((order) => (
                                    <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg bg-card shadow-sm">
                                        <div>
                                            <p className="font-semibold">{order.token_number ? `Token #${order.token_number}` : `Order #${order.id.slice(-4)}`}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">₹{order.totalAmount.toFixed(2)}</p>
                                            <p className="text-xs text-muted-foreground uppercase">{order.status}</p>
                                        </div>
                                    </div>
                                ))}
                                {filteredOrders.length > 15 && (
                                    <p className="text-xs text-center text-muted-foreground mt-4">Showing most recent 15 orders</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Selling Items */}
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle>Top Selling Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topItems.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No data available for top items.</p>
                            ) : (
                                topItems.map(([name, qty], index) => (
                                    <div key={name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                                                {index + 1}
                                            </div>
                                            <span className="font-medium">{name}</span>
                                        </div>
                                        <span className="font-bold">{qty}x</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                    <CardHeader className="border-t mt-4">
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" variant="outline" onClick={() => router.push('/admin/menu')}>
                            Manage Menu Items
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

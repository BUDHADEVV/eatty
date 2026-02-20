'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    created_at: string;
}

export default function Dashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/orders?limit=100')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setOrders(data);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const completedOrders = orders.filter(o => o.status === 'completed');

    const today = new Date().setHours(0, 0, 0, 0);
    const todaysOrders = orders.filter(o => new Date(o.created_at).getTime() >= today);
    const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Owner Dashboard</h2>
                <p className="text-muted-foreground">Overview of your restaurant's performance and recent sales.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{todaysRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            From {todaysOrders.length} orders today
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">All Time Revenue</CardTitle>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {orders.length} total orders
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedOrders.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Successfully served
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Active Queue</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orders.filter(o => ['pending', 'cooking', 'ready'].includes(o.status)).length}</div>
                        <p className="text-xs text-muted-foreground">
                            Orders currently in process
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4 mt-4">
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.slice(0, 10).map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id.slice(-4)}</TableCell>
                                    <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">₹{order.totalAmount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
}

interface Order {
    id: string;
    items: OrderItem[];
    status: string;
    customerName?: string;
    customerPhone?: string;
    token_number?: number;
    createdAt: string;
}

export default function KitchenQueue() {
    const [orders, setOrders] = useState<Order[]>([]);

    const fetchOrders = () => {
        fetch('/api/orders?date=today&limit=200')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setOrders(data);
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        fetchOrders();
        // Poll every 10 seconds
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchOrders();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkReady = async (order: Order) => {
        await updateStatus(order.id, 'ready');

        if (order.customerPhone) {
            const itemList = order.items.map(i => `▪️ ${i.quantity}x ${i.name}`).join('\n');
            const tokenDisplay = order.token_number ? `*Token ${order.token_number}*` : `*Order #${order.id.slice(-4)}*`;
            const message = `Hi ${order.customerName || 'Customer'}, your ${tokenDisplay} is ready for pickup! 🍽️\n\n*Your Order:*\n${itemList}\n\nThank you for choosing Eatya!`;
            // Clean phone number (remove any non-digit characters just in case, though ideally validated earlier)
            const cleanPhone = order.customerPhone.replace(/\D/g, '');
            const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
            window.open(waLink, '_blank');
        } else {
            alert(`Order #${order.id.slice(-4)} marked ready. (No WhatsApp number provided to notify customer)`);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
            case 'cooking': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            case 'ready': return 'bg-green-100 text-green-800 hover:bg-green-200';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Kitchen Queue</h2>
                <p className="text-muted-foreground">Manage active orders. Mark as ready to notify customers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {orders.filter(o => o.status !== 'completed').map((order) => (
                    <Card key={order.id} className="flex flex-col border-2 border-muted shadow-md">
                        <CardHeader className="p-4 pb-2 border-b bg-muted/20">
                            <div className="flex justify-between items-center mb-1">
                                <CardTitle className="text-lg">Token #{order.token_number || order.id.slice(-4)}</CardTitle>
                                <Badge variant="secondary" className={getStatusColor(order.status)}>
                                    {order.status.toUpperCase()}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString()} {order.customerName ? `- ${order.customerName}` : ''}</p>
                        </CardHeader>
                        <CardContent className="p-4 flex-1">
                            <ul className="space-y-2">
                                {order.items.map((item, idx) => (
                                    <li key={idx} className="flex justify-between text-base border-b border-dashed pb-1 last:border-0 font-medium">
                                        <span>{item.quantity}x {item.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 gap-2 grid grid-cols-2 mt-auto">
                            {(order.status === 'pending' || order.status === 'cooking') && (
                                <Button className="col-span-2 w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => handleMarkReady(order)}>
                                    Mark Ready & Notify
                                </Button>
                            )}
                            {order.status === 'ready' && (
                                <>
                                    <Button variant="outline" className="w-full text-muted-foreground border-2" onClick={() => updateStatus(order.id, 'pending')}>
                                        Undo
                                    </Button>
                                    <Button className="w-full border-2 border-green-600 text-green-700 bg-green-50 hover:bg-green-100" onClick={() => updateStatus(order.id, 'completed')}>
                                        Complete
                                    </Button>
                                </>
                            )}
                        </CardFooter>
                    </Card>
                ))}
                {orders.filter(o => o.status !== 'completed').length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                        No active orders at the moment.
                    </div>
                )}
            </div>

            {orders.filter(o => o.status === 'completed').length > 0 && (
                <div className="mt-8">
                    <div className="h-1 bg-red-500 w-full rounded my-6 opacity-70" />
                    <h3 className="text-2xl font-bold tracking-tight mb-4 text-muted-foreground">Completed Today</h3>
                    <div className="space-y-3">
                        {orders.filter(o => o.status === 'completed').map(order => (
                            <div key={order.id} className="flex justify-between items-center p-4 border-2 rounded-lg bg-muted/30">
                                <div>
                                    <p className="font-semibold text-lg">Token #{order.token_number || order.id.slice(-4)}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(order.createdAt).toLocaleTimeString()} {order.customerName ? `- ${order.customerName}` : ''}
                                        {order.items.length > 0 ? ` (${order.items.length} items)` : ''}
                                    </p>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <Button variant="ghost" size="sm" className="text-muted-foreground underline" onClick={() => updateStatus(order.id, 'ready')}>
                                        Undo
                                    </Button>
                                    <Badge variant="outline" className="bg-gray-200 text-gray-700">COMPLETED</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: string;
}

interface CartItem extends MenuItem {
    quantity: number;
}

export default function POSPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [visits, setVisits] = useState<number | null>(null);
    const [discountType, setDiscountType] = useState<'none' | '10percent' | 'flat50'>('none');

    useEffect(() => {
        fetch('/api/menu')
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Failed to fetch menu. Check internet connection or Supabase settings.');
                }
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) setMenuItems(data);
            })
            .catch((err) => {
                console.error(err);
                alert(err.message);
            });
    }, []);

    useEffect(() => {
        if (!customerPhone || customerPhone.replace(/\D/g, '').length < 5) {
            setVisits(null);
            return;
        }
        const timer = setTimeout(() => {
            fetch(`/api/customer-stats?phone=${encodeURIComponent(customerPhone)}`)
                .then(res => res.json())
                .then(data => setVisits(data.visits))
                .catch(err => console.error(err));
        }, 500);
        return () => clearTimeout(timer);
    }, [customerPhone]);

    const addToCart = (item: MenuItem) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((i) => i.id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart((prev) =>
            prev.map((i) => {
                if (i.id === id) {
                    const newQuantity = i.quantity + delta;
                    return { ...i, quantity: newQuantity > 0 ? newQuantity : 1 };
                }
                return i;
            })
        );
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let discountAmount = 0;
    if (discountType === '10percent') discountAmount = subtotal * 0.10;
    if (discountType === 'flat50') discountAmount = 50;
    if (discountAmount > subtotal) discountAmount = subtotal;

    const afterDiscount = subtotal - discountAmount;
    const cgst = afterDiscount * 0.025; // 2.5% CGST
    const sgst = afterDiscount * 0.025; // 2.5% SGST
    const grandTotal = afterDiscount + cgst + sgst;

    const placeOrder = async () => {
        if (cart.length === 0) return;
        setIsSubmitting(true);
        try {
            const finalItems = cart.map(item => ({
                menuItem: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            }));

            if (discountAmount > 0) {
                finalItems.push({
                    menuItem: 'DISCOUNT',
                    name: discountType === '10percent' ? 'Discount (10%)' : 'Discount (₹50 Flat)',
                    price: -discountAmount,
                    quantity: 1
                });
            }

            const orderData = {
                items: finalItems,
                totalAmount: grandTotal,
                customerPhone,
                customerName,
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            if (res.ok) {
                const data = await res.json();
                // Clear cart
                setCart([]);
                setCustomerName('');
                setCustomerPhone('');
                setDiscountType('none');
                setVisits(null);

                alert(`Order Placed Successfully! Token: #${data.token_number || data.id.slice(-4)}`);

                // Open receipt print page
                window.open(`/print/${data.id}`, '_blank');
            } else {
                const errData = await res.json();
                alert(`Failed to place order: ${errData.error || 'Unknown error'}. Check internet connection.`);
            }
        } catch (err: any) {
            console.error(err);
            alert(`Network error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = Array.from(new Set(menuItems.map((i) => i.category)));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="col-span-2 flex flex-col gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2">Point of Sale</h2>
                    <p className="text-muted-foreground">Tap items to add them to the current order.</p>
                </div>

                <ScrollArea className="h-[calc(100vh-140px)]">
                    {categories.map((category) => (
                        <div key={category} className="mb-6 border-b pb-4">
                            <h3 className="text-xl font-semibold mb-4 capitalize">{category}</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {menuItems
                                    .filter((item) => item.category === category)
                                    .map((item) => (
                                        <Card
                                            key={item.id}
                                            className="cursor-pointer hover:border-primary transition-colors flex flex-col justify-between"
                                            onClick={() => addToCart(item)}
                                        >
                                            <CardHeader className="p-4 pb-2">
                                                <CardTitle className="text-base leading-tight">{item.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-2">
                                                <p className="font-bold text-primary">₹{item.price.toFixed(2)}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                            </div>
                        </div>
                    ))}
                    {menuItems.length === 0 && (
                        <p className="text-muted-foreground p-8 text-center border border-dashed rounded-lg">
                            No menu items yet. Add them in the Menu Admin section.
                        </p>
                    )}
                </ScrollArea>
            </div>

            <div className="flex flex-col border rounded-xl overflow-hidden bg-muted/20">
                <div className="p-4 border-b bg-card">
                    <h3 className="font-semibold text-lg">Current Order</h3>
                </div>

                <ScrollArea className="flex-1 p-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground mt-20">
                            Cart is empty
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex flex-col gap-2 p-3 bg-card rounded-lg border shadow-sm">
                                    <div className="flex justify-between font-medium">
                                        <span>{item.name}</span>
                                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}>
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-6 text-center">{item.quantity}</span>
                                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}>
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 border-t bg-card mt-auto space-y-4">
                    <div className="space-y-2">
                        <Input
                            placeholder="Customer Name (Optional)"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                        <Input
                            placeholder="WhatsApp Number (e.g. +123456789) "
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                        {visits !== null && (
                            <div className="text-sm px-1 font-medium text-emerald-600 flex justify-between items-center bg-emerald-50 rounded p-1 border border-emerald-100">
                                <span>Total Past Orders:</span>
                                <span className="font-bold text-lg">{visits}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button variant={discountType === '10percent' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setDiscountType(discountType === '10percent' ? 'none' : '10percent')}>10% OFF</Button>
                        <Button variant={discountType === 'flat50' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setDiscountType(discountType === 'flat50' ? 'none' : 'flat50')}>₹50 OFF</Button>
                    </div>

                    <div className="space-y-1 py-2 border-t text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-medium">
                                <span>Discount Apply</span>
                                <span>-₹{discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                            <span>CGST (2.5%)</span>
                            <span>₹{cgst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>SGST (2.5%)</span>
                            <span>₹{sgst.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="flex justify-between text-xl font-bold py-2 border-t">
                        <span>Grand Total</span>
                        <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                    <Button
                        className="w-full text-lg h-12"
                        size="lg"
                        onClick={placeOrder}
                        disabled={cart.length === 0 || isSubmitting}
                    >
                        {isSubmitting ? 'Processing...' : 'Place Order'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

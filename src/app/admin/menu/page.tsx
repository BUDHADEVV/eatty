'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
}

export default function MenuAdmin() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    const fetchMenu = () => {
        setIsLoading(true);
        fetch('/api/menu')
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Failed to fetch menu. Check internet connection or Supabase settings.');
                }
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) setItems(data);
            })
            .catch((err) => {
                console.error(err);
                alert(err.message);
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !category) return;

        try {
            const res = await fetch('/api/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    price: parseFloat(price),
                    category: category.toLowerCase(),
                    description: description || 'No description',
                }),
            });

            if (res.ok) {
                setName('');
                setPrice('');
                setCategory('');
                setDescription('');
                fetchMenu();
            } else {
                const errData = await res.json();
                alert(`Failed to add item: ${errData.error || 'Unknown error'}. Check internet connection.`);
            }
        } catch (err: any) {
            console.error(err);
            alert(`Network error: ${err.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchMenu();
            } else {
                const errData = await res.json();
                alert(`Failed to delete item: ${errData.error || 'Unknown error'}`);
            }
        } catch (err: any) {
            console.error(err);
            alert(`Network error: ${err.message}`);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Menu Management</h2>
                <p className="text-muted-foreground">Add and manage items available on the point of sale.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 border-2">
                    <CardHeader>
                        <CardTitle>Add New Item</CardTitle>
                        <CardDescription>Enter details to add an item to your menu.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Item Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₹)</Label>
                                <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" placeholder="e.g. Burgers, Drinks, Sides" value={category} onChange={(e) => setCategory(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <Button type="submit" className="w-full">Add Item</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-2">
                    <CardHeader>
                        <CardTitle>Current Menu</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                        {isLoading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No menu items found. Add one!</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="capitalize">{item.category}</TableCell>
                                            <TableCell>₹{item.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

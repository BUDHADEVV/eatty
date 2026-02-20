import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
    try {
        // Delete all orders
        const { error: ordersError } = await supabase
            .from('orders')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything

        if (ordersError) {
            console.error('Error deleting orders:', ordersError);
            return NextResponse.json(
                { error: 'Failed to delete orders' },
                { status: 500 }
            );
        }

        // Delete all menu items
        const { error: menuError } = await supabase
            .from('menu_items')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything

        if (menuError) {
            console.error('Error deleting menu items:', menuError);
            return NextResponse.json(
                { error: 'Failed to delete menu items' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Database reset successfully' });
    } catch (error) {
        console.error('Error resetting database:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

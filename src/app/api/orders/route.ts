import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const searchParams = new URL(req.url).searchParams;
        const status = searchParams.get('status');
        const dateFilter = searchParams.get('date');
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

        let query = supabase.from('orders').select('*');

        if (status === 'active') {
            query = query.in('status', ['pending', 'cooking', 'ready']);
        } else if (status) {
            query = query.eq('status', status);
        }

        if (dateFilter === 'today') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            query = query.gte('created_at', startOfDay.toISOString());
        }

        const { data: orders, error } = await query
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Calculate Daily Token Number
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { count, error: countError } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfDay.toISOString());

        const token_number = (count || 0) + 1;

        const { data: order, error } = await supabase
            .from('orders')
            .insert([{ ...body, token_number, created_at: new Date().toISOString() }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(order, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

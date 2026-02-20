import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const searchParams = new URL(req.url).searchParams;
        const phone = searchParams.get('phone');
        if (!phone) return NextResponse.json({ visits: 0 });

        const { count, error } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('customerPhone', phone);

        if (error) throw error;
        return NextResponse.json({ visits: count || 0 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

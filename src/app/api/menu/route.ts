import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: menuItems, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('category', { ascending: true })
            .order('name', { ascending: true });

        if (error) throw error;

        return NextResponse.json(menuItems);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { data: menuItem, error } = await supabase
            .from('menu_items')
            .insert([body])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(menuItem, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

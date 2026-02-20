import { supabase } from './lib/supabase';

async function setupTables() {
    console.log('Initiating Supabase schema setup...');

    // We'll create a dummy order first to implicitly trigger Supabase's auto-schema generation
    // if the table doesn't exist, though typically Supabase requires explicit table creation
    // via the Dashboard or SQL Editor. Let's provide the exact SQL the user needs to run.
    console.log('Please open your Supabase Dashboard -> SQL Editor and run the following:');

    const sql = `
-- Create Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    items JSONB NOT NULL,
    totalAmount NUMERIC NOT NULL,
    customerName TEXT,
    customerPhone TEXT,
    token_number INTEGER,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
    `;

    console.log(sql);
}

setupTables();

import { createClient } from '@supabase/supabase-js';
import type { Database } from 'src/types/supabase';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default supabase; 
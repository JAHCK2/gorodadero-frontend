// ═══════════════════════════════════════════
// GoRodadero — Cliente Supabase
// ═══════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eoqethwihsupbcivmgvw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ugOar5a6musoxokSDdX39A_evForlNb';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

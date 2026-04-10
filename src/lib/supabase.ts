// ═══════════════════════════════════════════
// GoRodadero — Cliente Supabase
// ═══════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://eoqethwihsupbcivmgvw.supabase.co';
const supabaseAnonKey = 'sb_publishable_ugOar5a6musoxokSDdX39A_evForlNb';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

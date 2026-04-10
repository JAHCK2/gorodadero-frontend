import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eoqethwihsupbcivmgvw.supabase.co';
const supabaseKey = 'sb_publishable_ugOar5a6musoxokSDdX39A_evForlNb';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Fetching one product from Supabase...");
    const { data: pData, error: pError } = await supabase.from('productos').select('*').limit(1);
    if (pError) console.error("Error products:", pError);
    else console.log("Product:", pData[0]);
}

main();

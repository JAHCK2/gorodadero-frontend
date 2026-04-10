import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eoqethwihsupbcivmgvw.supabase.co';
const supabaseKey = 'sb_publishable_ugOar5a6musoxokSDdX39A_evForlNb';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data } = await supabase.from('productos').select('categoria, subcategoria');
  const counts = {};
  const subsByCat = {};
  data.forEach(d => { 
      counts[d.categoria] = (counts[d.categoria] || 0) + 1; 
      if (!subsByCat[d.categoria]) subsByCat[d.categoria] = new Set();
      subsByCat[d.categoria].add(d.subcategoria);
  });
  console.log("Categorias:", counts);
  console.log("Subcategorias Bebidas:", Array.from(subsByCat['Bebidas'] || []));
  console.log("Subcategorias Licores:", Array.from(subsByCat['Licores y Tabaco'] || []));
}
run();

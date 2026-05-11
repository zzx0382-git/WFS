import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';

const supabaseUrl = 'https://waxllnzmoddzhdoukwvb.supabase.co';
const supabaseAnonKey = 'sb_publishable_uRi5Md1Dw9y6NGJwwceoFQ_7CeEvR0P';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
const SUPABASE_URL = 'https://eteyskwaqjtcybaolnto.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iUQ7S9Z9ZNCkOQ4pJmB0Fg_kaxPNWNe';

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jbgzyvgiespdwllohgfl.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_kjxLU6g5QYhhDvCV2Ah5Ig_NsW7fEuG';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

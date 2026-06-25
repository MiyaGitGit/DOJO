import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Configuration Supabase manquante : vérifie que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies dans .env",
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

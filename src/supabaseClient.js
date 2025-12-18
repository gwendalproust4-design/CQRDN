import { createClient } from '@supabase/supabase-js'

// REMPLACE AVEC TES CLES SUPABASE (Project Settings > API)
const supabaseUrl = 'https://vqramkwatsolxfxypiwh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcmFta3dhdHNvbHhmeHlwaXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDg5NzUsImV4cCI6MjA4MTMyNDk3NX0.6nDBX84Sy1DO0aG73vhNW3klzSJGzpM_xT2GIYDfVYk'

export const supabase = createClient(supabaseUrl, supabaseKey)
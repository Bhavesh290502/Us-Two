import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nuvyaqcaxoihslguorjm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dnlhcWNheG9paHNsZ3VvcmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTkyNTcsImV4cCI6MjA4MDA5NTI1N30.PMCGTZFAaJdhqtsIGey8L5aoOgdkx98ZIbZ9FIlo8tI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

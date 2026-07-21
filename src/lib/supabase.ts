import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://ndaubqbbirutpczlztqt.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kYXVicWJiaXJ1dHBjemx6dHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDczNTgsImV4cCI6MjEwMDIyMzM1OH0.cNPi8Ms76T5wsyR_OPCB9mGOzFH6ZM2uVsEjPhOhWJs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

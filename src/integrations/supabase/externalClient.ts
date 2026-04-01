import { createClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = 'https://xwcgqwlttywvhnoxesmy.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Y2dxd2x0dHl3dmhub3hlc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzE5NzgsImV4cCI6MjA4Nzg0Nzk3OH0.DjkpZy7yztzbBdDVhpJWPLcvR0nZlWU-lGybHdutCss';

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);

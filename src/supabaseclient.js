import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hipmiuhyvdaqlaxbnwxx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcG1pdWh5dmRhcWxheGJud3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MjUzNzMsImV4cCI6MjA2MzMwMTM3M30.dokjX1p7YSZGPwouJEukDlxOVWEs2_woY6OIvw6V8jM';

export const supabase = createClient(supabaseUrl, supabaseKey);

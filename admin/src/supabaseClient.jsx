// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ouscjkmgdsnzakairivo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91c2Nqa21nZHNuemFrYWlyaXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzY0MzYsImV4cCI6MjA3MTUxMjQzNn0.ii49ymR7Bi7WZTYOkYnE1-kJIlZ7DV5xR_tM3kbX-MU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
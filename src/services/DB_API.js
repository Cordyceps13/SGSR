import {createClient} from "@supabase/supabase-js";


const supabaseUrl = 'https://lcylyhgbcqsghfmfkwvj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjeWx5aGdiY3FzZ2hmbWZrd3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NjA3MjIsImV4cCI6MjA1MjAzNjcyMn0.Z2wqegq_k824FRhv794BAp6GYnYgKFqAhSBs6BAHP4s';
export const supabase = createClient(supabaseUrl, supabaseKey);


// TESTE
// const supabaseUrl = 'https://dyfsgqnviftxwlayzxnl.supabase.co';
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5ZnNncW52aWZ0eHdsYXl6eG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NTQ4NjEsImV4cCI6MjA1MzIzMDg2MX0.4hWtVlyxKNgXi8L--R4hrDxuPKMNwmO-uF9M6rg8t_s';
// export const supabase = createClient(supabaseUrl, supabaseKey);
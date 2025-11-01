import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  user_id: string;
  created_at?: string; 
  updated_at?: string;
}

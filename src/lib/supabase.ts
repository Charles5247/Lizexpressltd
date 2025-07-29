import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Add logging to help diagnose environment variable loading
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create the Supabase client with optimized settings for production
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-application-name': 'lizexpress-app'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Simple connection test without blocking
supabase.auth.getSession()
  .then(() => {
    console.log('✅ Supabase connected successfully');
  })
  .catch(error => {
    console.warn('⚠️ Supabase connection warning:', error.message);
  });

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  residential_address: string | null;
  date_of_birth: string | null;
  language: string | null;
  gender: string | null;
  country: string | null;
  state: string | null;
  zip_code: string | null;
  nationality: string | null;
  is_verified: boolean;
  verification_submitted: boolean;
};

export type Item = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string;
  condition: string;
  buying_price: number | null;
  estimated_cost: number | null;
  swap_for: string | null;
  location: string | null;
  images: string[];
  receipt_image: string | null;
  status: string;
  created_at: string;
};

export type Chat = {
  id: string;
  item_id: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
};

export type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string | null;
  is_read: boolean;
  created_at: string;
};
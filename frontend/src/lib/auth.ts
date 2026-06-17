import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Intercept window.fetch to automatically append Supabase JWT token.
// Ensure it only attaches to requests going to OUR backend (NEXT_PUBLIC_API_URL)
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    let url = '';
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.href;
    } else if (input && typeof input === 'object' && 'url' in input) {
      url = (input as Request).url;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Attach authorization header ONLY if the request goes to our backend API URL
    if (url.startsWith(apiUrl)) {
      try {
        const sessionRes = await supabase.auth.getSession();
        const token = sessionRes.data.session?.access_token;
        if (token) {
          init = init || {};
          const headers = new Headers(init.headers || {});
          headers.set('Authorization', `Bearer ${token}`);
          init.headers = headers;
          const request = { url };
          console.log('Auth header attached:', request.url, !!token);
        }
      } catch (err) {
        console.warn('Failed to get session in fetch interceptor:', err);
      }
    }
    const res = await originalFetch(input, init);
    if (res.status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
      supabase.auth.signOut();
      window.location.href = '/auth';
    }
    return res;
  };
}

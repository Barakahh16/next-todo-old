'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) return;
    let error = null;
    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      error = signUpError;
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      error = signInError;
    }

    if (!error) router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white text-black p-4">
      <h1 className="text-2xl font-bold mb-4">{isSignUp ? 'Sign Up' : 'Login'}</h1>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        className="border border-gray-400 rounded p-2 mb-2 w-full max-w-xs"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        className="border border-gray-400 rounded p-2 mb-2 w-full max-w-xs"
      />
      <button
        onClick={handleAuth}
        className="bg-black text-white font-bold px-4 py-2 rounded mb-2 w-full max-w-xs hover:bg-gray-800"
      >
        {isSignUp ? 'Sign Up' : 'Login'}
      </button>
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="text-sm text-gray-700 underline"
      >
        {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}

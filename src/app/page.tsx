"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import AuthForm from '@/components/auth/AuthForm';
import AuditDashboard from '@/components/audit/AuditDashboard'; // Need to rename current page default to this
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-terminal-amber" size={32} />
          <span className="text-[10px] text-zinc-600 font-mono tracking-[0.3em] uppercase">Authenticating Terminal...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background ambience */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,184,0,0.03)_0%,_transparent_70%)]" />
        <AuthForm />
      </div>
    );
  }

  return <AuditDashboard />;
}

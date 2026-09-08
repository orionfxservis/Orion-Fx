import React, { useState, useEffect } from 'react';
import { UserAccount, ThemeConfig } from '../types';
import { Check, Star, Play, Disc } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { saveUserDataToSupabase, MyBeatBoxUserData } from '../services/orionfxSupabase';

interface OnboardingFlowProps {
  theme: ThemeConfig;
  onComplete: (updatedUser: UserAccount & { bio?: string }) => void;
}

export default function OnboardingFlow({ theme, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // User state starts empty, gets populated by Supabase Auth
  const [user, setUser] = useState<UserAccount & { bio?: string } | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsAuthenticating(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUserAuthenticated(session.user);
      }
      setIsAuthenticating(false);
    });

    // Listen for OAuth redirects back to the app
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        handleUserAuthenticated(session.user);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleUserAuthenticated = (supabaseUser: any) => {
    const meta = supabaseUser.user_metadata;
    const authenticatedUser = {
      uid: supabaseUser.id,
      name: meta.full_name || meta.name || 'BeatBox User',
      email: supabaseUser.email || '',
      avatar: meta.avatar_url || meta.picture || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff',
      favoriteGenres: ['Electronic', 'Chill'],
      bio: 'Ready to create.'
    };
    setUser(authenticatedUser);
    setStep(2); // Automatically advance to Account Detected step
  };

  const handleGoogleLogin = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      alert("Supabase is not configured! Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
      return;
    }
    
    // Redirects to Google
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    });
  };

  const handleConfirmAccount = () => {
    setStep(3);
  };

  const handleSelectPlan = async (plan: 'free' | 'pro') => {
    if (!user) return;
    
    setSelectedPlan(plan);
    const updatedUser = { ...user, plan, packageTier: plan };
    setUser(updatedUser);

    // Save to Supabase DB
    const userDataToSave: MyBeatBoxUserData = {
      user_id: updatedUser.uid,
      project_name: 'mybeatbox',
      user_name: updatedUser.name,
      email: updatedUser.email,
      avatar_url: updatedUser.avatar,
      theme_id: theme.id,
      playlists: [],
      favorite_songs: [],
    };
    await saveUserDataToSupabase(userDataToSave);

    if (plan === 'pro') {
      setStep(4);
    } else {
      // Free goes straight to home
      setTimeout(() => {
        onComplete(updatedUser);
      }, 500);
    }
  };

  const handleFinishPro = () => {
    if (user) onComplete(user);
  };

  // If still checking auth on initial load, show a tiny spinner or nothing
  if (isAuthenticating && step === 1) {
    return (
      <div className={`min-h-[100dvh] w-full ${theme.bgClass} flex items-center justify-center`}>
        <Disc className="w-8 h-8 text-cyan-400 animate-spin-slow" />
      </div>
    );
  }

  return (
    <div className={`min-h-[100dvh] w-full ${theme.bgClass} flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden relative`}>
      {/* Background glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50" 
        style={{ 
          background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${
            theme.customAccentHex || (theme.id === 'obsidian' ? '#10b98130' : '#ec489930')
          }, transparent 70%)`
        }} 
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-60" />

      {/* STEP 1: Welcome */}
      {step === 1 && (
        <div className={`w-full max-w-sm ${theme.cardClass} ${theme.borderClass} border p-8 rounded-3xl flex flex-col items-center text-center animate-fade-in relative z-10 backdrop-blur-md`}>
          <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center mb-6">
            <Disc className="w-8 h-8 text-cyan-400 animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">MyBeatBox</h1>
          <p className="text-cyan-300/80 font-mono text-xs mb-6 uppercase tracking-widest">
            Your Music.<br/>Your Workspace.
          </p>
          <p className={`${theme.mutedTextClass} text-sm mb-10`}>
            Discover music, create playlists and explore intelligent audio tools.
          </p>

          <button
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-white text-black font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition shadow-lg active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 flex flex-col items-center gap-1">
            <span className={`${theme.mutedTextClass} text-xs`}>Already have an account?</span>
            <button className="text-cyan-400 text-xs font-semibold hover:underline">Sign in</button>
          </div>
        </div>
      )}

      {/* STEP 2: Account Detected */}
      {step === 2 && user && (
        <div className={`w-full max-w-sm ${theme.cardClass} ${theme.borderClass} border p-8 rounded-3xl flex flex-col items-center text-center animate-fade-in relative z-10 backdrop-blur-md`}>
          <h2 className="text-lg font-bold text-white/50 mb-8 uppercase tracking-widest font-mono">MyBeatBox</h2>
          
          <div className="w-24 h-24 rounded-full border-4 border-cyan-500/30 p-1 mb-5 relative">
            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-[#090b14] flex items-center justify-center">
              <Check className="w-4 h-4 text-white stroke-[3]" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Welcome, {user.name.split(' ')[0]}!</h1>
          <p className={`${theme.mutedTextClass} text-sm mb-6`}>{user.email}</p>

          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-semibold mb-8 border border-emerald-500/20">
            <Check className="w-3.5 h-3.5" /> Google account linked
          </div>

          <button
            onClick={handleConfirmAccount}
            className={`w-full h-12 ${theme.primaryButtonClass} rounded-xl flex items-center justify-center gap-2 transition active:scale-95 text-sm uppercase tracking-wide`}
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 3: Choose Plan */}
      {step === 3 && (
        <div className={`w-full max-w-md flex flex-col items-center animate-fade-in relative z-10`}>
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Choose Your Experience</h2>
          <p className={`${theme.mutedTextClass} text-sm mb-8 text-center`}>Select a plan to tailor your MyBeatBox workspace.</p>

          <div className="w-full flex flex-col gap-4">
            {/* Free Plan */}
            <div 
              onClick={() => handleSelectPlan('free')}
              className={`w-full ${theme.cardClass} ${theme.borderClass} border p-5 rounded-2xl cursor-pointer hover:border-white/20 transition-all active:scale-[0.98] flex flex-col backdrop-blur-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-xl">🆓</span> FREE
                </h3>
                <span className={`${theme.mutedTextClass} text-sm font-semibold`}>Rs. 0 / month</span>
              </div>
              <p className="text-cyan-300/80 font-mono text-xs uppercase mb-4 tracking-wider">Explore MyBeatBox</p>
              <div className="flex flex-col gap-2 mb-5">
                <div className="flex items-center gap-2 text-sm text-white/80"><Check className="w-4 h-4 text-cyan-400" /> Music Discovery</div>
                <div className="flex items-center gap-2 text-sm text-white/80"><Check className="w-4 h-4 text-cyan-400" /> Basic Search</div>
                <div className="flex items-center gap-2 text-sm text-white/80"><Check className="w-4 h-4 text-cyan-400" /> Create Playlists</div>
              </div>
              <button className="w-full py-2.5 rounded-lg border border-white/10 text-white/80 font-semibold hover:bg-white/5 transition text-sm">
                CONTINUE FREE
              </button>
            </div>

            {/* Pro Plan */}
            <div 
              onClick={() => handleSelectPlan('pro')}
              className={`w-full bg-gradient-to-br from-[#1a0a2e] to-[#090b14] border border-amber-500/40 p-5 rounded-2xl cursor-pointer hover:border-amber-400 shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)] transition-all active:scale-[0.98] flex flex-col relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                Most Popular
              </div>
              <div className="flex items-center justify-between mb-2 mt-1">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> PRO
                </h3>
                <span className="text-amber-400 text-sm font-semibold">Rs. 499 / month</span>
              </div>
              
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 mb-4 mt-2 flex flex-col items-center text-center">
                <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><Star className="w-3 h-3 fill-amber-400"/> First 100 Users</span>
                <span className="text-white text-sm font-bold">REGISTER NOW</span>
                <span className="text-amber-300 text-xs font-semibold">GET 1 YEAR FREE SUBSCRIPTION</span>
              </div>

              <div className="flex flex-col gap-2 mb-5">
                <div className="flex items-center gap-2 text-sm text-white/90"><Check className="w-4 h-4 text-amber-500" /> Advanced AI Integration</div>
                <div className="flex items-center gap-2 text-sm text-white/90"><Check className="w-4 h-4 text-amber-500" /> Unlimited Playlists</div>
                <div className="flex items-center gap-2 text-sm text-white/90"><Check className="w-4 h-4 text-amber-500" /> Advanced Audio EQ</div>
                <div className="flex items-center gap-2 text-sm text-white/90"><Check className="w-4 h-4 text-amber-500" /> Studio Effects & Mixing</div>
                <div className="flex items-center gap-2 text-sm text-white/90"><Check className="w-4 h-4 text-amber-500" /> High Quality Export</div>
              </div>
              <button className="w-full py-2.5 rounded-lg bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition hover:bg-amber-400 text-sm">
                REGISTER NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Registration Confirmation (PRO Only) */}
      {step === 4 && (
        <div className={`w-full max-w-sm ${theme.cardClass} border border-amber-500/30 p-8 rounded-3xl flex flex-col items-center text-center animate-fade-in relative z-10 backdrop-blur-md shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)]`}>
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">You're In!</h1>
          <p className="text-amber-400/90 font-mono text-xs uppercase mb-6 tracking-wider">Welcome to MyBeatBox</p>
          
          <p className={`${theme.mutedTextClass} text-sm mb-4`}>
            Your <strong className="text-amber-400 font-bold">PRO</strong> membership has been activated successfully.
          </p>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 w-full mb-8">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-bold mb-1">
              <Star className="w-4 h-4 fill-amber-400" /> 1 YEAR FREE
            </div>
            <p className="text-[10px] text-amber-300/70 font-mono uppercase tracking-widest">Offer: First 100 Users</p>
          </div>

          <button
            onClick={handleFinishPro}
            className="w-full h-12 bg-amber-500 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95 text-sm uppercase tracking-wide"
          >
            ENTER MYBEATBOX <Play className="w-4 h-4 fill-black" />
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Gift, Check, X, ShieldCheck, Crown, Zap, ArrowRight, UserPlus, Eye, EyeOff, Lock, AlertCircle, Star } from 'lucide-react';
import { UserAccount, ThemeConfig } from '../types';
import { SUBSCRIPTION_PACKAGES } from '../data/packagesData';

interface RegisterOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount & { bio?: string };
  onUpdateUser?: (updated: UserAccount & { bio?: string }) => void;
  theme?: ThemeConfig;
  onSubscriptionClaimed?: () => void;
}

export default function RegisterOfferModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onSubscriptionClaimed,
}: RegisterOfferModalProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<'free' | 'pro'>('pro');
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isClaimed, setIsClaimed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentPkg = SUBSCRIPTION_PACKAGES.find(p => p.id === selectedPackageId) || SUBSCRIPTION_PACKAGES[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    // Check if password was entered and matches
    if (password && password !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    if (password && password.length < 6) {
      setPasswordError('Password should be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsClaimed(true);
      
      // Update persistent user with VIP subscription package badge
      if (onUpdateUser) {
        const pkgBadge = currentPkg.badge;
        onUpdateUser({
          ...currentUser,
          name: name.trim() || currentUser.name,
          email: email.trim() || currentUser.email,
          packageTier: selectedPackageId,
          bio: (currentUser.bio ? currentUser.bio + ' • ' : '') + `${pkgBadge} Subscriber (${currentPkg.name})`
        });
      }

      // Store in localStorage
      try {
        localStorage.setItem('mybeatbox_vip_offer_claimed', 'true');
        localStorage.setItem('mybeatbox_vip_package', selectedPackageId);
        localStorage.setItem('mybeatbox_vip_claimed_at', Date.now().toString());
      } catch (err) {
        console.error('Storage error', err);
      }

      if (onSubscriptionClaimed) {
        onSubscriptionClaimed();
      }
    }, 650);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      id="register-offer-modal-overlay"
    >
      <div 
        className="w-full max-w-lg bg-gradient-to-b from-[#1c1308] via-[#120a03] to-[#080401] border-2 border-amber-400/60 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.4)] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-scale-in relative"
        onClick={(e) => e.stopPropagation()}
        id="register-offer-modal-content"
      >
        {/* Glowing Background Radial Blobs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Banner */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-amber-500/30 flex items-center justify-between bg-black/50 z-10 relative">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black flex items-center justify-center font-bold shadow-md shadow-amber-500/30 shrink-0">
              <Gift className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">
                  🎧 MYBEATBOX PLANS
                </span>
                <span className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-mono font-bold bg-amber-400 text-black uppercase">
                  {currentPkg.badge}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                {isClaimed ? 'Congratulations! Offer Unlocked' : 'Register & Claim 1 Year Free'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
            id="btn-close-register-modal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-3.5 sm:p-4.5 overflow-y-auto flex flex-col gap-3 z-10 scrollbar-thin">
          {isClaimed ? (
            /* Claimed Success View */
            <div className="flex flex-col items-center justify-center text-center gap-3 py-2 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-emerald-400 text-black flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-bounce">
                <Crown className="w-6 h-6 fill-current" />
              </div>

              <div className="flex flex-col gap-0.5">
                <h3 className="text-lg sm:text-xl font-extrabold text-white animate-text-glow">
                  {currentPkg.name.toUpperCase()} {currentPkg.badge} ACTIVE!
                </h3>
                <p className="text-xs text-amber-200/80 max-w-sm">
                  Welcome to MyBeatBox {currentPkg.name}. Your 1 Year Free pass has been registered to <span className="font-semibold text-white">{email || 'your account'}</span>.
                </p>
              </div>

              <div className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left flex flex-col gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Unlocked Pro Features:
                </span>
                <ul className="text-[11px] text-white/80 space-y-1 pl-1">
                  {currentPkg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-amber-400" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-black font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:shadow-[0_0_30px_rgba(245,158,11,0.8)] transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Start Listening with Pro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Registration Form View */
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              {/* 🏷️ Package Selection Cards (FREE vs PRO) */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-white/70">
                  <span className="flex items-center gap-1">
                    <span>🎧 SELECT YOUR PLAN</span>
                  </span>
                  <span className="text-amber-400 font-extrabold">{currentPkg.badge}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SUBSCRIPTION_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageId(pkg.id as 'free' | 'pro')}
                        className={`p-2.5 rounded-xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50'
                            : 'bg-black/40 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <div className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold tracking-tight truncate self-start ${
                            isSelected ? 'bg-amber-400 text-black shadow-sm' : 'bg-white/10 text-white/80'
                          }`}>
                            {pkg.badge}
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-white leading-none mt-0.5">{pkg.name}</span>
                          <span className="text-[10px] text-white/50">{pkg.tagline}</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-xs sm:text-sm font-mono font-bold text-amber-300">{pkg.price}</span>
                          <span className="text-[9px] text-white/40 block leading-tight">{pkg.period}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pro Launch Offer Callout inside registration modal */}
              {selectedPackageId === 'pro' && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-400/60 flex flex-col gap-1 text-center">
                  <div className="text-[10.5px] font-mono font-black text-amber-300 uppercase tracking-wide flex items-center justify-center gap-1">
                    <span>🎁 THIS OFFER IS VALID FOR THE FIRST 100 USERS</span>
                  </div>
                  <div className="text-xs font-bold text-white">
                    REGISTER NOW & GET 1 YEAR FREE SUBSCRIPTION
                  </div>
                  <div className="text-[10px] text-amber-200/80 font-mono">
                    First-year charges → FREE for the first 100 registered users
                  </div>
                </div>
              )}

              {/* Input Fields - Grid for compact height */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10.5px] font-semibold text-white/80 flex items-center gap-1">
                    <UserPlus className="w-3 h-3 text-amber-400" />
                    <span>Your Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Faisal Hussain"
                    className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 focus:outline-none text-white text-xs placeholder:text-white/30"
                  />
                </div>

                <div className="flex flex-col gap-0.5">
                  <label className="text-[10.5px] font-semibold text-white/80 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 focus:outline-none text-white text-xs placeholder:text-white/30"
                  />
                </div>

                {/* Create Password Field */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10.5px] font-semibold text-white/80 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>Create Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 focus:outline-none text-white text-xs placeholder:text-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10.5px] font-semibold text-white/80 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>Confirm Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 focus:outline-none text-white text-xs placeholder:text-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Match Error Display */}
              {passwordError && (
                <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5 animate-shake">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-1 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-black font-black text-xs sm:text-sm uppercase tracking-wider font-mono shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:shadow-[0_0_35px_rgba(245,158,11,0.85)] transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                id="btn-register-modal-submit"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Activating Account...</span>
                  </span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current shrink-0 text-amber-900" />
                    <span>[ {selectedPackageId === 'pro' ? 'REGISTER NOW' : 'GET STARTED'} ]</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-white/50 font-mono">
                By registering, you get instant account creation with zero credit card required.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

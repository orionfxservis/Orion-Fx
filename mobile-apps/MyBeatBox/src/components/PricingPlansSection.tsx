import { useState } from 'react';
import { Check, Sparkles, Star, Zap, Gift, ArrowRight } from 'lucide-react';
import { SUBSCRIPTION_PACKAGES, SubscriptionPackage } from '../data/packagesData';
import { UserAccount, ThemeConfig } from '../types';
import RegisterOfferModal from './RegisterOfferModal';

interface PricingPlansSectionProps {
  currentUser: UserAccount & { bio?: string };
  onUpdateUser?: (updated: UserAccount & { bio?: string }) => void;
  theme?: ThemeConfig;
  onOpenProfile?: () => void;
}

export default function PricingPlansSection({
  currentUser,
  onUpdateUser,
  theme,
}: PricingPlansSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPackage, setTargetPackage] = useState<'free' | 'pro'>('pro');

  const freePkg = SUBSCRIPTION_PACKAGES.find((p) => p.id === 'free') || SUBSCRIPTION_PACKAGES[0];
  const proPkg = SUBSCRIPTION_PACKAGES.find((p) => p.id === 'pro') || SUBSCRIPTION_PACKAGES[1];

  const handleSelectPlan = (planId: 'free' | 'pro') => {
    setTargetPackage(planId);
    if (planId === 'free') {
      if (onUpdateUser) {
        onUpdateUser({
          ...currentUser,
          packageTier: 'free',
        });
      }
      try {
        localStorage.setItem('mybeatbox_vip_package', 'free');
      } catch (e) {}
    } else {
      setIsModalOpen(true);
    }
  };

  const currentTier = currentUser.packageTier || 'free';

  return (
    <section 
      id="mybeatbox-pricing-plans"
      className="w-full flex flex-col gap-5 py-4 animate-fade-in text-white"
    >
      {/* Section Header */}
      <div className="flex flex-col items-center text-center gap-1.5 px-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
          <span>🎧</span>
          <span>MYBEATBOX PLANS</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white mt-1">
          Choose the plan that's right for you
        </h2>
        <p className="text-xs sm:text-sm text-white/60 max-w-md">
          Simple, creator-focused pricing built for mobile audio workflows.
        </p>
      </div>

      {/* Mobile-First Stacked / Responsive Grid */}
      <div className="w-full flex flex-col gap-4 max-w-xl mx-auto">
        {/* ========================================================================= */}
        {/* 1. FREE PLAN CARD                                                         */}
        {/* ========================================================================= */}
        <div
          id="pricing-card-free"
          className={`w-full relative rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-slate-900/90 via-[#0d1424]/90 to-black/95 border transition-all duration-200 flex flex-col justify-between gap-5 ${
            currentTier === 'free'
              ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          {/* Header & Badges */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl" role="img" aria-label="free">
                  🆓
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-wide">
                  {freePkg.name}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 tracking-wider">
                {freePkg.badge}
              </span>
            </div>

            {/* Tagline */}
            <p className="text-xs sm:text-sm text-white/70 font-medium">
              {freePkg.tagline}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {freePkg.price}
              </span>
              <span className="text-xs text-white/50 font-mono">
                {freePkg.period}
              </span>
            </div>
          </div>

          {/* Feature Checklist */}
          <div className="border-t border-white/10 pt-4 flex flex-col gap-2.5">
            <ul className="space-y-2">
              <li className="flex items-center gap-2.5 text-xs sm:text-sm text-white/90">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span className="flex items-center gap-1.5">
                  <span>🎵</span>
                  <span>Music Discovery</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-xs sm:text-sm text-white/90">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span className="flex items-center gap-1.5">
                  <span>🔎</span>
                  <span>Basic Search</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-xs sm:text-sm text-white/90">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span className="flex items-center gap-1.5">
                  <span>🎶</span>
                  <span>Create Playlists</span>
                </span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => handleSelectPlan('free')}
            className={`w-full py-3 rounded-2xl text-xs sm:text-sm font-extrabold uppercase tracking-wider font-mono transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
              currentTier === 'free'
                ? 'bg-white/10 hover:bg-white/15 text-cyan-300 border border-cyan-500/30'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
            id="btn-pricing-free-cta"
          >
            <span>{currentTier === 'free' ? 'CURRENT PLAN' : freePkg.ctaText}</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. PRO PLAN CARD (⭐ MOST POPULAR + 🎁 LAUNCH OFFER)                      */}
        {/* ========================================================================= */}
        <div
          id="pricing-card-pro"
          className="w-full relative rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-[#1c1206]/95 via-[#130b02]/95 to-[#080401]/98 border-2 border-amber-400/80 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col justify-between gap-5 relative overflow-hidden group"
        >
          {/* Subtle Glow Backdrop */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header */}
          <div className="flex flex-col gap-3 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl" role="img" aria-label="pro">
                  ⭐
                </span>
                <h3 className="text-lg sm:text-xl font-black text-amber-200 tracking-wide">
                  {proPkg.name}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-extrabold bg-amber-400 text-black shadow-md tracking-wider flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                <span>{proPkg.badge}</span>
              </span>
            </div>

            {/* Tagline */}
            <p className="text-xs sm:text-sm text-amber-100/80 font-medium">
              {proPkg.tagline}
            </p>

            {/* =================================================================== */}
            {/* 🎁 LAUNCH OFFER BOX - INSIDE PRO CARD DIRECTLY ABOVE PRICING       */}
            {/* =================================================================== */}
            <div 
              id="pro-launch-offer-banner"
              className="w-full relative rounded-2xl p-3.5 sm:p-4 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-950/40 border border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex flex-col gap-2 my-1"
            >
              {/* ASCII Frame Corner Accents */}
              <div className="flex items-center justify-between text-[10px] font-mono text-amber-400/80 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-300" />
                  <span>🎁 THIS OFFER IS VALID</span>
                </span>
                <span className="text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/40">
                  FIRST 100 USERS
                </span>
              </div>

              <div className="flex flex-col gap-0.5 text-center py-1">
                <span className="text-xs font-mono font-extrabold text-amber-200/90 tracking-wide uppercase">
                  REGISTER NOW
                </span>
                <h4 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 uppercase tracking-tight">
                  GET 1 YEAR FREE SUBSCRIPTION
                </h4>
              </div>

              <div className="pt-1.5 border-t border-amber-400/20 text-[10.5px] font-mono text-amber-300/90 text-center">
                First-year charges → <strong className="text-white font-extrabold underline decoration-amber-400">FREE</strong> for the first 100 registered users
              </div>
            </div>

            {/* Regular Pro Price Display */}
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                {proPkg.price}
              </span>
              <span className="text-xs text-amber-200/60 font-mono">
                {proPkg.period}
              </span>
            </div>
          </div>

          {/* Feature Checklist */}
          <div className="border-t border-amber-500/20 pt-4 flex flex-col gap-2.5 z-10">
            <ul className="space-y-2">
              <li className="flex items-center gap-2.5 text-xs sm:text-sm text-amber-100/95 font-medium">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>Everything in Free</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs sm:text-sm text-white">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span className="flex items-center gap-1.5">
                  <span>🤖</span>
                  <span>Advanced AI Music Discovery</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-xs sm:text-sm text-white">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span className="flex items-center gap-1.5">
                  <span>🎵</span>
                  <span>Unlimited Playlists</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-xs sm:text-sm text-white">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span className="flex items-center gap-1.5">
                  <span>🎚️</span>
                  <span>Advanced Audio Tools</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-xs sm:text-sm text-white">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span className="flex items-center gap-1.5">
                  <span>🎛️</span>
                  <span>Studio Effects</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-xs sm:text-sm text-white">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span className="flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Priority Processing</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-xs sm:text-sm text-white">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span className="flex items-center gap-1.5">
                  <span>📤</span>
                  <span>High-Quality Export</span>
                </span>
              </li>
            </ul>
          </div>

          {/* CTA: [ REGISTER NOW ] */}
          <button
            type="button"
            onClick={() => handleSelectPlan('pro')}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-black font-black text-xs sm:text-sm uppercase tracking-wider font-mono shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:shadow-[0_0_35px_rgba(245,158,11,0.85)] transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2 z-10"
            id="btn-pricing-pro-cta"
          >
            <Zap className="w-4 h-4 fill-current shrink-0 text-amber-900" />
            <span>[ {proPkg.ctaText} ]</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Modal for Pro Registration / 1 Year Free Activation */}
      <RegisterOfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={onUpdateUser}
        theme={theme}
      />
    </section>
  );
}

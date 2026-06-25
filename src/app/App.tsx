import { useState, useEffect } from "react";
import {
  Sparkles, Star, MapPin, Clock, ChevronRight, ChevronLeft,
  Check, Calendar, Search, ArrowRight, Heart, Shield, Zap,
  Phone, Mail, Instagram, Twitter, Scissors, Droplets,
  Sun, Smile, X, Menu, User
} from "lucide-react";
import { apiUrl } from "@/lib/api";

type Screen =
  | "login"
  | "signup"
  | "landing"
  | "wizard"
  | "ai-rec"
  | "listing"
  | "details"
  | "booking"
  | "confirmation"
  | "reschedule";

const PURPLE = "#6C63FF";
const LAVENDER = "#EAE6FF";
const ROSE = "#E8B4A0";

// ──────────────────────────────────────────────────────────────────────
// Shared Atoms
// ──────────────────────────────────────────────────────────────────────

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 group"
      style={{ fontFamily: "'Playfair Display', serif" }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
        style={{ background: `linear-gradient(135deg, ${PURPLE}, #9B94FF)` }}
      >
        S&
      </div>
      <span className="text-xl font-semibold tracking-tight text-[#2D2D3F]">
        Slot<span style={{ color: PURPLE }}>&</span>Style
      </span>
    </button>
  );
}

function PrimaryButton({
  children,
  onClick,
  className = "",
  disabled = false,
  fullWidth = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${fullWidth ? "w-full" : ""} px-6 py-3.5 rounded-xl text-white font-medium text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #9B94FF 100%)` }}
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3.5 rounded-xl border font-medium text-sm transition-all duration-200 hover:bg-[#EAE6FF] text-[#6C63FF] border-[#6C63FF]/20 ${className}`}
    >
      {children}
    </button>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
      <span className="text-xs text-[#7B7A92] ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 1. LOGIN
// ──────────────────────────────────────────────────────────────────────

function LoginScreen({ go }: { go: (s: Screen) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (v: string) => {
    if (!v.trim()) return "Please enter a valid email address.";
    if (!EMAIL_REGEX.test(v.trim())) return "Please enter a valid email address.";
    return null;
  };

  const validatePassword = (v: string) => {
    if (!v) return "Password is required.";
    if (v.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  useEffect(() => {
    setEmailError(validateEmail(email));
  }, [email]);

  useEffect(() => {
    setPasswordError(validatePassword(password));
  }, [password]);

  const canSubmit = !emailError && !passwordError && !!email.trim() && !!password && password.length >= 6 && !isSigningIn;

  const handleSubmit = async () => {
    setFormError(null);

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);

    if (eErr || pErr) return;

    setIsSigningIn(true);
    try {
      const response = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        setFormError(data?.message || "Invalid email or password.");
        return;
      }

      // If login succeeds, keep the existing navigation flow.
      go("wizard");
    } catch {
      setFormError("Unable to connect. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${PURPLE} 0%, #4A3FCC 100%)` }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 20%, ${ROSE} 0%, transparent 60%), radial-gradient(circle at 80% 80%, ${LAVENDER} 0%, transparent 60%)`,
          }}
        />
        <Logo />
        <div className="relative z-10">
          <h2
            className="text-4xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Your beauty journey starts here.
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            AI-powered recommendations matched to your lifestyle, budget, and beauty goals.
          </p>
        </div>
        <div className="relative z-10 flex flex-col gap-3">
          {["Personalized AI recommendations", "Top-rated salons near you", "Seamless booking experience"].map((t) => (
            <div key={t} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-white/80 text-sm">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <div className="mb-8">
            <h1
              className="text-3xl font-bold text-[#2D2D3F] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Welcome back
            </h1>
            <p className="text-[#7B7A92] text-sm">Sign in to continue your beauty journey</p>
          </div>

          {/* Google */}
          <button
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-[#E5E5EF] text-[#2D2D3F] text-sm font-medium hover:bg-[#F8F7FF] transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={async () => {
              if (isSigningIn) return;
              setFormError(null);
              setIsSigningIn(true);
              try {
                setFormError("Google Sign-In is currently unavailable.");
              } finally {
                setIsSigningIn(false);
              }
            }}
            disabled={isSigningIn}
          >
            {""}
            <svg className="w-4 h-4" viewBox="0 0 24 24">

              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#E5E5EF]" />
            <span className="text-xs text-[#7B7A92]">or sign in with email</span>
            <div className="flex-1 h-px bg-[#E5E5EF]" />
          </div>

          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label className="text-xs font-medium text-[#2D2D3F] block mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={emailError ? true : undefined}
                className="w-full px-4 py-3 rounded-xl bg-[#F8F7FF] border border-transparent focus:border-[#6C63FF]/30 focus:outline-none text-sm text-[#2D2D3F] placeholder:text-[#BBBBC8] transition-colors"
              />
              {emailError && (
                <p className="mt-1.5 text-xs text-red-500">⚠ {emailError}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#2D2D3F]">Password</label>
                <button className="text-xs text-[#6C63FF] hover:underline">Forgot password?</button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                aria-invalid={passwordError ? true : undefined}
                className="w-full px-4 py-3 rounded-xl bg-[#F8F7FF] border border-transparent focus:border-[#6C63FF]/30 focus:outline-none text-sm text-[#2D2D3F] placeholder:text-[#BBBBC8] transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (canSubmit) handleSubmit();
                  }
                }}
              />
              {passwordError && (
                <p className="mt-1.5 text-xs text-red-500">⚠ {passwordError}</p>
              )}
            </div>
          </div>

          {formError && (
            <p className="text-xs text-red-500 mb-4">{formError}</p>
          )}

          <PrimaryButton
            fullWidth
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center justify-center gap-2"
          >
            {isSigningIn ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/70 border-t-white animate-spin" />
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </PrimaryButton>

          <p className="text-center text-sm text-[#7B7A92] mt-6">
            New to Slot&Style?{" "}
            <button className="text-[#6C63FF] font-medium hover:underline" onClick={() => go("signup")}>
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 2. LANDING PAGE
// ──────────────────────────────────────────────────────────────────────

const SERVICES = [
  { icon: Scissors, label: "Hair Styling", count: "2.4k salons", color: "#6C63FF" },
  { icon: Droplets, label: "Skin & Facials", count: "1.8k studios", color: "#E8B4A0" },
  { icon: Smile, label: "Makeup Artist", count: "980 artists", color: "#FF6B8A" },
  { icon: Sun, label: "Spa & Massage", count: "1.2k spas", color: "#FFB347" },
];

const STEPS = [
  {
    n: "01",
    title: "Tell us your vibe",
    desc: "Answer a few quick questions about your goals, budget, and schedule.",
  },
  {
    n: "02",
    title: "AI builds your plan",
    desc: "Our engine analyzes thousands of salons to find your perfect matches.",
  },
  {
    n: "03",
    title: "Book & enjoy",
    desc: "Reserve instantly. Show up, relax, and let the professionals do their thing.",
  },
];

const WHY = [
  { icon: Sparkles, title: "AI-Powered Matching", desc: "Recommendations trained on 50k+ bookings and real user preferences." },
  { icon: Shield, title: "Verified Professionals", desc: "Every salon is vetted for quality, hygiene, and customer satisfaction." },
  { icon: Zap, title: "Instant Booking", desc: "No calls, no waiting. Lock in your slot in under 60 seconds." },
  { icon: Heart, title: "Loyalty Rewards", desc: "Earn points on every booking. Redeem for free services and upgrades." },
];

const TESTIMONIALS = [
  {
    name: "Priya Mehra",
    role: "Corporate Executive",
    text: "The AI matched me with a salon that does exactly the kind of balayage I had in mind — I didn't even have to describe it properly. Booked in 2 minutes.",
    avatar: "PM",
    rating: 5,
  },
  {
    name: "Arjun Kapoor",
    role: "Entrepreneur",
    text: "I was skeptical about an AI recommending a barber. Then I walked out looking like a GQ cover. Slot&Style is the real deal.",
    avatar: "AK",
    rating: 5,
  },
  {
    name: "Riya Sharma",
    role: "Creative Director",
    text: "Finally a platform that understands I want premium without pretentiousness. The spa it found me is now my weekly ritual.",
    avatar: "RS",
    rating: 5,
  },
];

function LandingScreen({ go }: { go: (s: Screen) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#6C63FF]/08">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo onClick={() => {}} />
          <div className="hidden md:flex items-center gap-8 text-sm text-[#7B7A92]">
            <button
              className="hover:text-[#6C63FF] transition-colors"
              onClick={() => {
                document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Services
            </button>
            <button
              className="hover:text-[#6C63FF] transition-colors"
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              How It Works
            </button>
            <button
              className="hover:text-[#6C63FF] transition-colors"
              onClick={() => {
                document.getElementById("why-us")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Why Us
            </button>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm text-[#6C63FF] font-medium hover:underline" onClick={() => go("login")}>
              Sign in
            </button>
            <PrimaryButton onClick={() => go("wizard")} className="text-sm">
              Get Started
            </PrimaryButton>
          </div>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5 text-[#2D2D3F]" /> : <Menu className="w-5 h-5 text-[#2D2D3F]" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-[#E5E5EF] px-6 py-4 flex flex-col gap-4 bg-white">
            <button
              className="text-left text-sm text-[#7B7A92]"
              onClick={() => {
                document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Services
            </button>
            <button
              className="text-left text-sm text-[#7B7A92]"
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              How It Works
            </button>
            <button
              className="text-left text-sm text-[#7B7A92]"
              onClick={() => {
                document.getElementById("why-us")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Why Us
            </button>
            <button className="text-left text-sm text-[#7B7A92]" onClick={() => go("login")}>Sign in</button>
            <PrimaryButton onClick={() => go("wizard")}>Get Started</PrimaryButton>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% -10%, ${LAVENDER}, transparent)`,
          }}
        />
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#EAE6FF] text-[#6C63FF] text-xs font-medium px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Beauty Concierge
            </div>
            <h1
              className="text-5xl md:text-6xl font-bold text-[#2D2D3F] mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Discover Your Perfect{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${PURPLE}, ${ROSE})` }}
              >
                Self-Care Experience
              </span>
            </h1>
            <p className="text-lg text-[#7B7A92] mb-10 leading-relaxed max-w-xl mx-auto">
              AI-powered recommendations tailored to your lifestyle, budget, and beauty goals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <PrimaryButton onClick={() => go("wizard")} className="px-8 py-4 text-base">
                <span className="flex items-center gap-2">
                  Start Consultation <ArrowRight className="w-4 h-4" />
                </span>
              </PrimaryButton>
              <GhostButton
                onClick={() => {
                  window.localStorage.removeItem("slotStyle:selectedCategory");
                  go("listing");
                }}
              >
                Browse Salons
              </GhostButton>
            </div>
          </div>

          {/* Hero image */}
          <div className="mt-14 rounded-2xl overflow-hidden shadow-xl shadow-[#6C63FF]/10 max-w-4xl mx-auto">
            <img
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=500&fit=crop&auto=format"
              alt="Premium salon interior with warm lighting and elegant styling stations"
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section id="services" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-bold text-[#2D2D3F] mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Popular Services
          </h2>
          <p className="text-[#7B7A92]">Thousands of verified professionals across every category</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SERVICES.map(({ icon: Icon, label, count, color }) => (
            <button
              key={label}
              onClick={() => {
                const category = label === "Hair Styling" ? "Hair" :
                  label === "Skin & Facials" ? "Skin" :
                  label === "Makeup Artist" ? "Makeup" :
                  "Spa";

                window.localStorage.setItem("slotStyle:selectedCategory", category);
                go("listing");
              }}
              className="group bg-white border border-[#6C63FF]/10 rounded-2xl p-6 flex flex-col items-center gap-4 hover:shadow-lg hover:shadow-[#6C63FF]/08 hover:border-[#6C63FF]/25 transition-all duration-200 text-center"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: `${color}18` }}
              >
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <div>
                <p className="font-semibold text-[#2D2D3F] text-sm mb-1">{label}</p>
                <p className="text-xs text-[#7B7A92]">{count}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-[#F8F7FF] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2
              className="text-3xl font-bold text-[#2D2D3F] mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              How It Works
            </h2>
            <p className="text-[#7B7A92]">From consultation to confirmation in minutes</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.n} className="relative">
                <div
                  className="text-6xl font-bold mb-4 bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${LAVENDER}, ${ROSE})`,
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {step.n}
                </div>
                <h3 className="text-lg font-semibold text-[#2D2D3F] mb-2">{step.title}</h3>
                <p className="text-[#7B7A92] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Slot&Style */}
      <section id="why-us" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2
            className="text-3xl font-bold text-[#2D2D3F] mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Why Slot&Style
          </h2>
          <p className="text-[#7B7A92]">Built for the discerning beauty explorer</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {WHY.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-5 p-6 rounded-2xl border border-[#6C63FF]/10 bg-white hover:border-[#6C63FF]/25 transition-colors group">
              <div className="w-11 h-11 rounded-xl bg-[#EAE6FF] flex items-center justify-center flex-shrink-0 group-hover:bg-[#6C63FF] transition-colors">
                <Icon className="w-5 h-5 text-[#6C63FF] group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2D2D3F] mb-1.5">{title}</h3>
                <p className="text-sm text-[#7B7A92] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20" style={{ background: `linear-gradient(160deg, ${PURPLE}08 0%, ${ROSE}10 100%)` }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2
              className="text-3xl font-bold text-[#2D2D3F] mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Loved by Beauty Explorers
            </h2>
            <p className="text-[#7B7A92]">Real reviews from our community</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-[#6C63FF]/08">
                <StarRating rating={t.rating} />
                <p className="text-sm text-[#2D2D3F] leading-relaxed my-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: `linear-gradient(135deg, ${PURPLE}, ${ROSE})` }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2D2D3F]">{t.name}</p>
                    <p className="text-xs text-[#7B7A92]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div
          className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #4A3FCC 100%)` }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 80% 20%, ${ROSE}, transparent 50%)`,
            }}
          />
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4 relative z-10"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Ready to find your match?
          </h2>
          <p className="text-white/70 mb-8 relative z-10">Join 120,000+ beauty explorers already using Slot&Style.</p>
          <button
            onClick={() => go("wizard")}
            className="inline-flex items-center gap-2 bg-white text-[#6C63FF] font-semibold px-8 py-4 rounded-xl hover:bg-[#EAE6FF] transition-colors text-sm relative z-10"
          >
            Start Consultation <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#6C63FF]/10 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />
          <p className="text-xs text-[#7B7A92]">© 2025 Slot&Style. The Ultimate Matchmaker for Beauty Explorers.</p>
          <div className="flex items-center gap-4">
            <Instagram className="w-4 h-4 text-[#7B7A92] hover:text-[#6C63FF] cursor-pointer transition-colors" />
            <Twitter className="w-4 h-4 text-[#7B7A92] hover:text-[#6C63FF] cursor-pointer transition-colors" />
            <Mail className="w-4 h-4 text-[#7B7A92] hover:text-[#6C63FF] cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 3. CONSULTATION WIZARD
// ──────────────────────────────────────────────────────────────────────

const GOALS = [
  { label: "Relaxation", icon: "🧘", desc: "Unwind and de-stress" },
  { label: "New Look", icon: "✨", desc: "Refresh your style" },
  { label: "Event Prep", icon: "🎉", desc: "Look stunning for an occasion" },
  { label: "Self-Care Day", icon: "💆", desc: "Full pampering experience" },
];

const TIME_OPTIONS = ["2.5 hour", "4 hours", "Half day", "Full day"];

const SERVICE_OPTIONS = [
  "Haircut", "Colour & Balayage", "Facial", "Manicure", "Pedicure",
  "Massage", "Makeup", "Waxing", "Blowout", "Eyebrows",
];

const DELHI_AREAS = [
  "Saket",
  "Hauz Khas",
  "Connaught Place",
  "Greater Kailash",
  "Dwarka",
  "Rohini",
  "Karol Bagh",
  "Rajouri Garden",
  "South Extension",
  "Vasant Kunj",
];

function SignupScreen({ go }: { go: (s: Screen) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateName = (v: string) => {
    if (!v.trim()) return "Name is required.";
    return null;
  };
  const validateEmail = (v: string) => {
    if (!v.trim()) return "Please enter a valid email address.";
    if (!EMAIL_REGEX.test(v.trim())) return "Please enter a valid email address.";
    return null;
  };
  const validatePassword = (v: string) => {
    if (!v) return "Password is required.";
    if (v.length < 6) return "Password must be at least 6 characters.";
    return null;
  };
  const validateConfirm = (v: string) => {
    if (!v) return "Confirm your password.";
    if (v !== password) return "Passwords do not match.";
    return null;
  };

  useEffect(() => setNameError(validateName(name)), [name]);
  useEffect(() => setEmailError(validateEmail(email)), [email]);
  useEffect(() => setPasswordError(validatePassword(password)), [password]);
  useEffect(() => setConfirmError(validateConfirm(confirmPassword)), [confirmPassword, password]);

  const canSubmit =
    !nameError &&
    !emailError &&
    !passwordError &&
    !confirmError &&
    !!name.trim() &&
    !!email.trim() &&
    !!password &&
    !!confirmPassword &&
    !isCreating;

  const handleCreate = async () => {
    setFormError(null);

    const nErr = validateName(name);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const cErr = validateConfirm(confirmPassword);

    setNameError(nErr);
    setEmailError(eErr);
    setPasswordError(pErr);
    setConfirmError(cErr);

    if (nErr || eErr || pErr || cErr) return;

    setIsCreating(true);
    try {
      const response = await fetch(apiUrl("/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        setFormError(data?.message || "Unable to connect. Please try again.");
        return;
      }

      // After success, navigate normally (back to login)
      go("login");
    } catch {
      setFormError("Unable to connect. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${PURPLE} 0%, #4A3FCC 100%)` }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 20%, ${ROSE} 0%, transparent 60%), radial-gradient(circle at 80% 80%, ${LAVENDER} 0%, transparent 60%)`,
          }}
        />
        <Logo />
        <div className="relative z-10">
          <h2
            className="text-4xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Create your account
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Sign up to book salons and save your preferences.
          </p>
        </div>
        <div className="relative z-10 flex flex-col gap-3">
          {["Fast sign up", "Simple booking", "Your preferences saved"].map((t) => (
            <div key={t} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-white/80 text-sm">{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2D2D3F] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Sign up
            </h1>
            <p className="text-[#7B7A92] text-sm">Create an account to continue</p>
          </div>

          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label className="text-xs font-medium text-[#2D2D3F] block mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                aria-invalid={nameError ? true : undefined}
                className="w-full px-4 py-3 rounded-xl bg-[#F8F7FF] border border-transparent focus:border-[#6C63FF]/30 focus:outline-none text-sm text-[#2D2D3F] placeholder:text-[#BBBBC8] transition-colors"
              />
              {nameError && <p className="mt-1.5 text-xs text-red-500">⚠ {nameError}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-[#2D2D3F] block mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={emailError ? true : undefined}
                className="w-full px-4 py-3 rounded-xl bg-[#F8F7FF] border border-transparent focus:border-[#6C63FF]/30 focus:outline-none text-sm text-[#2D2D3F] placeholder:text-[#BBBBC8] transition-colors"
              />
              {emailError && <p className="mt-1.5 text-xs text-red-500">⚠ {emailError}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#2D2D3F]">Password</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                aria-invalid={passwordError ? true : undefined}
                className="w-full px-4 py-3 rounded-xl bg-[#F8F7FF] border border-transparent focus:border-[#6C63FF]/30 focus:outline-none text-sm text-[#2D2D3F] placeholder:text-[#BBBBC8] transition-colors"
              />
              {passwordError && <p className="mt-1.5 text-xs text-red-500">⚠ {passwordError}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#2D2D3F]">Confirm password</label>
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                aria-invalid={confirmError ? true : undefined}
                className="w-full px-4 py-3 rounded-xl bg-[#F8F7FF] border border-transparent focus:border-[#6C63FF]/30 focus:outline-none text-sm text-[#2D2D3F] placeholder:text-[#BBBBC8] transition-colors"
              />
              {confirmError && <p className="mt-1.5 text-xs text-red-500">⚠ {confirmError}</p>}
            </div>
          </div>

          {formError && <p className="text-xs text-red-500 mb-4">{formError}</p>}

          <PrimaryButton
            fullWidth
            onClick={handleCreate}
            disabled={!canSubmit}
            className="flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/70 border-t-white animate-spin" />
                Creating...
              </span>
            ) : (
              "Create Account"
            )}
          </PrimaryButton>

          <p className="text-center text-sm text-[#7B7A92] mt-6">
            Already have an account?{" "}
            <button className="text-[#6C63FF] font-medium hover:underline" onClick={() => go("login")}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function WizardScreen({ go }: { go: (s: Screen) => void }) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [budget, setBudget] = useState(3000);
  const [time, setTime] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [locationPreference, setLocationPreference] = useState<"CURRENT" | "AREA">("CURRENT");
  const [locationArea, setLocationArea] = useState("");


  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  const STEP_LABELS = ["Your Goal", "Budget", "Time", "Services", "Location"];

  function toggleService(s: string) {
    setServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  function canAdvance() {
    if (step === 0) return !!goal;
    if (step === 1) return true;
    if (step === 2) return !!time;
    if (step === 3) return services.length > 0;
    if (step === 4) {
      if (locationPreference === "CURRENT") return true;
      return !!locationArea;
    }

    return false;
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#6C63FF]/10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Logo onClick={() => go("landing")} />
            <span className="text-xs text-[#7B7A92]">Step {step + 1} of {totalSteps}</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-[#EAE6FF] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${PURPLE}, #9B94FF)` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STEP_LABELS.map((l, i) => (
              <span key={l} className={`text-[10px] font-medium ${i === step ? "text-[#6C63FF]" : i < step ? "text-[#9B94FF]" : "text-[#BBBBC8]"}`}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Step 0: Goal */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-[#2D2D3F] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              What's your goal today?
            </h2>
            <p className="text-[#7B7A92] mb-8 text-sm">Tell us what you're looking to achieve and we'll do the rest.</p>
            <div className="grid grid-cols-2 gap-4">
              {GOALS.map((g) => (
                <button
                  key={g.label}
                  onClick={() => setGoal(g.label)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-150 ${goal === g.label ? "border-[#6C63FF] bg-[#EAE6FF]" : "border-[#E5E5EF] bg-white hover:border-[#6C63FF]/30"}`}
                >
                  <span className="text-3xl block mb-3">{g.icon}</span>
                  <p className="font-semibold text-[#2D2D3F] text-sm mb-1">{g.label}</p>
                  <p className="text-xs text-[#7B7A92]">{g.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Budget */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-[#2D2D3F] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              What's your budget?
            </h2>
            <p className="text-[#7B7A92] mb-10 text-sm">We'll only show you options within your comfort zone.</p>
            <div className="text-center mb-8">
              <span
                className="text-5xl font-bold bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${PURPLE}, ${ROSE})`, fontFamily: "'Playfair Display', serif" }}
              >
                ₹{budget.toLocaleString()}
              </span>
              <p className="text-xs text-[#7B7A92] mt-2">per session</p>
            </div>
            <div className="relative px-2">
              <input
                type="range"
                min={500}
                max={15000}
                step={500}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 appearance-none rounded-full cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${PURPLE} 0%, ${PURPLE} ${((budget - 500) / 14500) * 100}%, #EAE6FF ${((budget - 500) / 14500) * 100}%, #EAE6FF 100%)`,
                }}
              />
              <div className="flex justify-between mt-3 text-xs text-[#7B7A92]">
                <span>₹500</span>
                <span>₹15,000</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-8">
              {[1000, 2500, 5000, 10000].map((b) => (
                <button
                  key={b}
                  onClick={() => setBudget(b)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${budget === b ? "bg-[#6C63FF] text-white border-[#6C63FF]" : "border-[#E5E5EF] text-[#7B7A92] hover:border-[#6C63FF]/30"}`}
                >
                  ₹{b.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Time */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-[#2D2D3F] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              How much time do you have?
            </h2>
            <p className="text-[#7B7A92] mb-8 text-sm">We'll fit the perfect experience into your schedule.</p>
            <div className="flex flex-col gap-3">
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-150 ${time === t ? "border-[#6C63FF] bg-[#EAE6FF]" : "border-[#E5E5EF] bg-white hover:border-[#6C63FF]/30"}`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className={`w-4 h-4 ${time === t ? "text-[#6C63FF]" : "text-[#7B7A92]"}`} />
                    <span className={`font-medium text-sm ${time === t ? "text-[#6C63FF]" : "text-[#2D2D3F]"}`}>{t}</span>
                  </div>
                  {time === t && (
                    <div className="w-5 h-5 rounded-full bg-[#6C63FF] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Services */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-[#2D2D3F] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              What services interest you?
            </h2>
            <p className="text-[#7B7A92] mb-8 text-sm">Select all that apply — we'll build a personalised bundle.</p>
            <div className="flex flex-wrap gap-2.5">
              {SERVICE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleService(s)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150 ${services.includes(s) ? "bg-[#6C63FF] border-[#6C63FF] text-white" : "border-[#E5E5EF] text-[#7B7A92] hover:border-[#6C63FF]/30 bg-white"}`}
                >
                  {services.includes(s) && <Check className="w-3 h-3 inline mr-1.5" />}
                  {s}
                </button>
              ))}
            </div>
            {services.length > 0 && (
              <p className="text-xs text-[#6C63FF] mt-4">{services.length} service{services.length > 1 ? "s" : ""} selected</p>
            )}
          </div>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-[#2D2D3F] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Location Preference
            </h2>
            <p className="text-[#7B7A92] mb-8 text-sm">Choose how you’d like us to match you with Delhi salons.</p>

            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={() => {
                  setLocationPreference("CURRENT");
                  setLocationArea("");
                }}
                className={`px-5 py-4 rounded-2xl border-2 transition-all duration-150 ${
                  locationPreference === "CURRENT" ? "border-[#6C63FF] bg-[#EAE6FF]" : "border-[#E5E5EF] bg-white hover:border-[#6C63FF]/30"
                }`}
              >
                <span className="font-medium text-sm text-[#2D2D3F]">Use Current Location</span>
                <span className="block text-xs text-[#7B7A92] mt-1">We’ll treat it as Delhi and recommend nearby options.</span>
              </button>

              <button
                onClick={() => setLocationPreference("AREA")}
                className={`px-5 py-4 rounded-2xl border-2 transition-all duration-150 ${
                  locationPreference === "AREA" ? "border-[#6C63FF] bg-[#EAE6FF]" : "border-[#E5E5EF] bg-white hover:border-[#6C63FF]/30"
                }`}
              >
                <span className="font-medium text-sm text-[#2D2D3F]">Enter Delhi Area</span>
                <span className="block text-xs text-[#7B7A92] mt-1">Select a Delhi locality from the list below.</span>
              </button>
            </div>

            {locationPreference === "AREA" && (
              <>
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B7A92]" />
                  <input
                    type="text"
                    placeholder="Type or search Delhi area"
                    value={locationArea}
                    onChange={(e) => setLocationArea(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F8F7FF] border border-transparent focus:border-[#6C63FF]/30 focus:outline-none text-sm text-[#2D2D3F] placeholder:text-[#BBBBC8]"
                  />
                </div>

                <p className="text-xs text-[#7B7A92] mb-3 font-medium uppercase tracking-wide">Popular Delhi areas</p>
                <div className="flex flex-wrap gap-2">
                  {DELHI_AREAS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setLocationArea(a)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm transition-all duration-150 ${
                        locationArea === a
                          ? "bg-[#6C63FF] border-[#6C63FF] text-white"
                          : "border-[#E5E5EF] text-[#7B7A92] hover:border-[#6C63FF]/30"
                      }`}
                    >
                      <MapPin className="w-3 h-3" />
                      {a}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12">
          <button
            onClick={() => step === 0 ? go("landing") : setStep((s) => s - 1)}
            className="flex items-center gap-2 text-sm text-[#7B7A92] hover:text-[#2D2D3F] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Back to home" : "Back"}
          </button>
          {step < totalSteps - 1 ? (
            <PrimaryButton onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
              <span className="flex items-center gap-2">Continue <ChevronRight className="w-4 h-4" /></span>
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onClick={async () => {
                const formData = {
                  goal,
                  budget,
                  time,
                  services,
                  location:
                    locationPreference === "CURRENT" ? "Use Current Location" : locationArea,
                };

                try {
                  const response = await fetch(apiUrl("/recommendation"), {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                  });

                  const data = await response.json();
                  // Log backend response in browser console
                  console.log(data);

                  // Store recommendations for AIRecScreen to render
                try {
                  const recs = data?.recommendations;
                  if (Array.isArray(recs)) {
                    window.localStorage.setItem("slotStyle:lastRecommendation", JSON.stringify(recs));
                  }
                } catch {
                  // ignore
                }

                try {
                  const normalizedLocation =
                    locationPreference === "CURRENT" ? "Current Location (Delhi)" : locationArea;

                  window.localStorage.setItem(
                    "slotStyle:wizardSelections",
                    JSON.stringify({
                      goal,
                      budget,
                      time,
                      location: normalizedLocation,
                    })
                  );
                } catch {
                  // ignore
                }
                } catch (err) {
                  console.error("Recommendation request failed:", err);
                }

                // Keep existing navigation / recommendation flow
                go("ai-rec");
              }}
              disabled={!canAdvance()}
              className="px-8"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Generate My Plan
              </span>
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 4. AI RECOMMENDATION
// ──────────────────────────────────────────────────────────────────────

function AIRecScreen({ go }: { go: (s: Screen) => void }) {
  const [recommendations, setRecommendations] = useState<Array<{ id: number; name: string; area: string; score: number; rating: number; priceRange: number; services: string[]; estimatedDuration?: number }>>([]);
  const [summary, setSummary] = useState<{ goal: string; budget: number; time: string; location: string } | null>(null);

  // Pull latest recommendation payload from localStorage (set by Wizard submit)

  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (hasFetched) return;
    setHasFetched(true);

    try {
      const rawRec = window.localStorage.getItem("slotStyle:lastRecommendation");
      if (rawRec) {
        const parsed = JSON.parse(rawRec);
        if (Array.isArray(parsed)) setRecommendations(parsed);
      }
    } catch {
      // ignore
    }

    try {
      const rawSummary = window.localStorage.getItem("slotStyle:wizardSelections");
      if (rawSummary) {
        const parsed = JSON.parse(rawSummary);
        if (parsed && typeof parsed === "object") {
          setSummary({
            goal: String((parsed as any).goal || ""),
            budget: Number((parsed as any).budget || 0),
            time: String((parsed as any).time || ""),
            location: String((parsed as any).location || ""),
          });
        }
      }
    } catch {
      // ignore
    }
  }, [hasFetched]);

  const DELHI_AREAS_ALLOWED = [
    "Saket",
    "Hauz Khas",
    "Connaught Place",
    "Greater Kailash",
    "Dwarka",
    "Rohini",
    "Karol Bagh",
    "Rajouri Garden",
    "South Extension",
    "Vasant Kunj",
    "Current Location (Delhi)",
  ] as const;

  const TIME_MAX_HOURS: Record<string, number> = {
    "1 hour": 1,
    "2 hours": 2,
    "Half day": 4,
    "Full day": 6,
  };

  function coerceNumber(n: any): number | null {
    const x = typeof n === "number" ? n : Number(n);
    return Number.isFinite(x) ? x : null;
  }

  function safeSalonName(s: any): string {
    const v = String(s || "").trim();
    return v || "Recommended Service";
  }

  const wizardBudget = summary ? coerceNumber(summary.budget) : null;
  const wizardTimeMaxHours = summary ? TIME_MAX_HOURS[String(summary.time || "")] : undefined;

  // Render-safe recommendations: enforce Delhi-only + budget + duration constraints.
  // If no valid recommendations remain after enforcement, show nothing (avoid static placeholder content).


  const afterDelhi = (recommendations.length
    ? recommendations.filter((r) => {
        const area = String(r.area || "");
        return DELHI_AREAS_ALLOWED.includes(area as any);
      })
    : []);

  const afterBudget = (afterDelhi.length
    ? afterDelhi.filter((r) => {
        if (wizardBudget === null) return true;
        const price = coerceNumber(r.priceRange);
        return price === null ? true : price <= wizardBudget;
      })
    : []);

  const afterDuration = (afterBudget.length
    ? afterBudget.filter((r) => {
        if (!wizardTimeMaxHours) return true;
        const dur = coerceNumber((r as any).estimatedDuration);
        return dur === null ? true : dur <= wizardTimeMaxHours;
      })
    : []);




  const backendFallback = afterDelhi
    .slice(0, 5)
    .map((r) => {
      const services0 = r.services?.[0] || "Recommended Service";
      const services1 = r.services?.[1];
      return {
        name: `${services0}${services1 ? " + " + services1 : ""}`,
        salon: safeSalonName((r as any).name),
        price: Number(r.priceRange),
        duration: (r as any).estimatedDuration ? `${(r as any).estimatedDuration}h` : "",
      };
    }) as Array<{ name: string; salon: string; price: number; duration: string }>;

  const filteredRecs = afterDuration
    .slice(0, 5)
    .map((r) => {
      const services0 = r.services?.[0] || "Recommended Service";
      const services1 = r.services?.[1];
      return {
        name: `${services0}${services1 ? " + " + services1 : ""}`,
        salon: safeSalonName((r as any).name),
        price: Number(r.priceRange),
        duration: (r as any).estimatedDuration ? `${(r as any).estimatedDuration}h` : "",
      };
    }) as Array<{ name: string; salon: string; price: number; duration: string }>;

  const recs = filteredRecs.length ? filteredRecs : backendFallback;






  return (

    <div className="min-h-screen bg-[#F8F7FF]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <Logo onClick={() => go("landing")} />
          <button onClick={() => go("wizard")} className="text-xs text-[#7B7A92] hover:text-[#6C63FF]">
            Edit preferences
          </button>
        </div>

        {/* AI badge */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${PURPLE}, #9B94FF)` }}
          >
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1
            className="text-2xl font-bold text-[#2D2D3F] mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Your AI-Curated Plan
          </h1>
          <p className="text-sm text-[#7B7A92]">Matched to your preferences with 94% confidence</p>
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-2xl p-6 border border-[#6C63FF]/10 mb-6 shadow-sm">
          <h3 className="text-xs font-medium text-[#7B7A92] uppercase tracking-wide mb-4">Your Session Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            {([
              { label: "Goal", value: summary?.goal || "" },
              {
                label: "Budget",
                value:
                  summary && typeof summary.budget === "number" && summary.budget > 0
                    ? `₹${summary.budget.toLocaleString()} / session`
                    : "",
              },
              { label: "Duration", value: summary?.time || "" },
              { label: "Location", value: summary?.location || "" },
            ] as const).map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-[#7B7A92] mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-[#2D2D3F]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended services */}
        <div className="bg-white rounded-2xl border border-[#6C63FF]/10 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#6C63FF]/08">
            <h3 className="text-xs font-medium text-[#7B7A92] uppercase tracking-wide">Recommended Services</h3>
          </div>
          {recs.map((r, i) => (
            <div key={r.name} className={`px-6 py-4 flex items-center justify-between ${i !== recs.length - 1 ? "border-b border-[#6C63FF]/08" : ""}`}>
              <div>
                <p className="text-sm font-semibold text-[#2D2D3F]">{r.name}</p>
                <p className="text-xs text-[#7B7A92] mt-0.5">{r.salon} · {r.duration}</p>
              </div>
              <span className="text-sm font-bold text-[#6C63FF]">₹{r.price.toLocaleString()}</span>
            </div>
          ))}
          <div className="px-6 py-4 bg-[#F8F7FF] flex items-center justify-between">
            <p className="text-sm font-semibold text-[#2D2D3F]">Estimated Total</p>
            <span
              className="text-base font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${PURPLE}, ${ROSE})` }}
            >
              ₹{recs.reduce((sum, r) => sum + (Number.isFinite(r.price) ? r.price : 0), 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* AI explanation (Gemini) */}
        {(() => {
          // localStorage is set by the wizard submit
          const raw = window.localStorage.getItem("slotStyle:lastAiSummary");
          const text = raw ? String(raw) : "";
          if (!text) return null;
          return (
            <div className="rounded-2xl p-5 mb-8" style={{ background: `linear-gradient(135deg, ${LAVENDER}, #FFF0E8)` }}>
              <p className="text-xs font-semibold text-[#6C63FF] mb-2">AI Explanation</p>
              <p className="text-sm text-[#2D2D3F] leading-relaxed">{text}</p>
            </div>
          );
        })()}


        {/* Insight */}
        {summary && (recs.length > 0) && (
          <div
            className="rounded-2xl p-5 mb-8 flex gap-4"
            style={{ background: `linear-gradient(135deg, ${LAVENDER}, #FFF0E8)` }}
          >
            <Sparkles className="w-5 h-5 text-[#6C63FF] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#2D2D3F] leading-relaxed">
              <strong>AI Insight:</strong> Showing Delhi-only options that fit your selected goal, services, budget, and time constraint.
            </p>
          </div>
        )}

        <PrimaryButton fullWidth onClick={() => go("listing")} className="py-4 text-base">
          <span className="flex items-center justify-center gap-2">
            View Matches <ArrowRight className="w-4 h-4" />
          </span>
        </PrimaryButton>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 5. SALON LISTING
// ──────────────────────────────────────────────────────────────────────

const SALONS = [
  {
    id: 1,
    name: "Alchemy Studio",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop&auto=format",
    match: 97,
    rating: 4.9,
    reviews: 412,
    distance: "1.2 km",
    price: "₹₹₹",
    category: "Hair & Skin",
    tags: ["Trending", "Fast Booking"],
  },
  {
    id: 2,
    name: "Aura Skin Lab",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop&auto=format",
    match: 94,
    rating: 4.8,
    reviews: 287,
    distance: "2.4 km",
    price: "₹₹₹₹",
    category: "Facials & Skin",
    tags: ["Premium"],
  },
  {
    id: 3,
    name: "Polish & Pout",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop&auto=format",
    match: 91,
    rating: 4.7,
    reviews: 198,
    distance: "0.8 km",
    price: "₹₹",
    category: "Nails & Makeup",
    tags: ["Walk-ins Welcome"],
  },
  {
    id: 4,
    name: "Serene Spa Collective",
    image: "https://images.unsplash.com/photo-1591343395082-e120087004b4?w=600&h=400&fit=crop&auto=format",
    match: 88,
    rating: 4.9,
    reviews: 341,
    distance: "3.1 km",
    price: "₹₹₹₹",
    category: "Spa & Wellness",
    tags: ["Luxury"],
  },
];

const FILTERS = ["All", "Hair", "Skin", "Nails", "Spa", "Makeup"];

type SalonCategory = "Hair" | "Skin" | "Makeup" | "Spa";

function categoryToFilter(category?: SalonCategory): string {
  if (!category) return "All";
  return category;
}

function ListingScreen({ go }: { go: (s: Screen) => void }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [saved, setSaved] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");


  useEffect(() => {
    const raw = window.localStorage.getItem("slotStyle:selectedCategory");
    const category = raw as SalonCategory | null;
    const next = categoryToFilter(category || undefined);
    setActiveFilter(next);

    // Clear after first apply so manual changes persist.
    window.localStorage.removeItem("slotStyle:selectedCategory");
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F7FF]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-[#6C63FF]/10 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => go("ai-rec")} className="flex items-center gap-2 text-sm text-[#7B7A92] hover:text-[#2D2D3F]">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <Logo onClick={() => go("landing")} />

            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#7B7A92]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search salons"
                className="w-48 px-3 py-2 rounded-xl bg-[#F8F7FF] border border-transparent focus:border-[#6C63FF]/30 focus:outline-none text-sm text-[#2D2D3F] placeholder:text-[#BBBBC8]"
                aria-label="Search salons by name"
              />
            </div>
          </div>
          <h1 className="text-xl font-bold text-[#2D2D3F] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Top Matches For You
          </h1>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${activeFilter === f ? "bg-[#6C63FF] border-[#6C63FF] text-white" : "border-[#E5E5EF] text-[#7B7A92] bg-white hover:border-[#6C63FF]/30"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        <p className="text-xs text-[#7B7A92] mb-4">{SALONS.length} salons matched · sorted by AI relevance</p>
        <div className="flex flex-col gap-5">
          {SALONS.filter((salon) => {
            // 1) Category filter (existing behavior)
            const passesCategory = (() => {
              if (activeFilter === "All") return true;
              if (activeFilter === "Hair") return salon.category.includes("Hair");
              if (activeFilter === "Skin") return salon.category.includes("Skin");
              if (activeFilter === "Makeup") return salon.category.includes("Makeup");
              if (activeFilter === "Spa") return salon.category.includes("Spa");
              return true;
            })();
            if (!passesCategory) return false;

            // 2) Name search filter (new behavior)
            const q = searchQuery.trim().toLowerCase();
            if (!q) return true;

            return salon.name.trim().toLowerCase().includes(q);
          }).map((salon) => (
            <div key={salon.id} className="bg-white rounded-2xl overflow-hidden border border-[#6C63FF]/08 shadow-sm hover:shadow-md hover:shadow-[#6C63FF]/08 transition-all group">
              <div className="relative h-44 bg-[#EAE6FF]">
                <img
                  src={salon.image}
                  alt={`${salon.name} interior`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3 h-3 text-[#6C63FF]" />
                  <span className="text-xs font-bold text-[#6C63FF]">{salon.match}% Match</span>
                </div>
                <button
                  onClick={() => setSaved((s) => s.includes(salon.id) ? s.filter((x) => x !== salon.id) : [...s, salon.id])}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/95 backdrop-blur rounded-xl flex items-center justify-center shadow-sm"
                >
                  <Heart className={`w-4 h-4 ${saved.includes(salon.id) ? "fill-red-400 text-red-400" : "text-[#7B7A92]"}`} />
                </button>
                <div className="absolute bottom-3 left-3 flex gap-1.5">
                  {salon.tags.map((tag) => (
                    <span key={tag} className="bg-black/40 backdrop-blur text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-[#2D2D3F] mb-0.5">{salon.name}</h3>
                    <p className="text-xs text-[#7B7A92]">{salon.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#7B7A92]">{salon.price}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#7B7A92] mb-4">
                  <StarRating rating={salon.rating} />
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {salon.distance}
                  </div>
                  <span>·</span>
                  <span>{salon.reviews} reviews</span>
                </div>
                <button
                  onClick={() => {
                    try {
                      window.localStorage.setItem(
                        "slotStyle:selectedSalon",
                        JSON.stringify({
                          id: salon.id,
                          name: salon.name,
                          location: salon.category,
                          rating: salon.rating,
                          services: SALON_SERVICES,
                          priceRange: salon.price,
                          description: salon.category,
                        })
                      );
                    } catch {
                      // ignore
                    }
                    window.localStorage.removeItem("slotStyle:selectedServices");
                    go("details");
                  }}
                  className="w-full py-2.5 rounded-xl border border-[#6C63FF]/25 text-sm text-[#6C63FF] font-medium hover:bg-[#EAE6FF] transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 6. SALON DETAILS
// ──────────────────────────────────────────────────────────────────────

const GALLERY = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1470259078422-826894b933aa?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop&auto=format",
];

const SALON_SERVICES = [
  { name: "Haircut & Blowout", duration: "1h 15m", price: 1400 },
  { name: "Keratin Treatment", duration: "3h", price: 4500 },
  { name: "Colour & Balayage", duration: "2h 30m", price: 3800 },
  { name: "Hydrating Facial", duration: "1h", price: 2200 },
  { name: "Threading & Cleanup", duration: "30m", price: 450 },
];

const DETAIL_REVIEWS = [
  { name: "Meera K.", avatar: "MK", rating: 5, text: "Absolutely transformed my hair. The balayage looks so natural and the stylists are incredibly skilled.", time: "2 weeks ago" },
  { name: "Rahul D.", avatar: "RD", rating: 5, text: "Premium experience from start to finish. The consultation was thorough and the result exceeded expectations.", time: "1 month ago" },
];

function DetailsScreen({ go }: { go: (s: Screen) => void }) {
  const [activeTab, setActiveTab] = useState<"services" | "reviews">("services");
  const [selectedImg, setSelectedImg] = useState(0);

  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<Array<{ id: string; name: string; price: number; duration: string; salonId: number }>>([]);

  useEffect(() => {
    try {
      const rawSalon = window.localStorage.getItem("slotStyle:selectedSalon");
      if (rawSalon) setSelectedSalon(JSON.parse(rawSalon));
    } catch {
      // ignore
    }

    try {
      const rawServices = window.localStorage.getItem("slotStyle:selectedServices");
      if (rawServices) {
        const parsed = JSON.parse(rawServices);
        if (Array.isArray(parsed)) setSelectedServices(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  function persistServices(next: typeof selectedServices) {
    try {
      window.localStorage.setItem("slotStyle:selectedServices", JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function toggleAddService(s: { name: string; duration: string; price: number; id?: string }) {
    const salonId = selectedSalon?.id;
    if (!salonId) return;

    const serviceId = s.id || String(s.name);
    const exists = selectedServices.some((x) => x.id === String(serviceId) && x.salonId === Number(salonId));
    if (exists) return;

    const next = [
      ...selectedServices,
      {
        id: String(serviceId),
        name: s.name,
        price: s.price,
        duration: s.duration,
        salonId: Number(salonId),
      },
    ];

    setSelectedServices(next);
    persistServices(next);
  }

  const selectedServicesTotal = selectedServices.reduce((sum, s) => sum + (Number.isFinite(s.price) ? s.price : 0), 0);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Back nav */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#6C63FF]/10">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => go("listing")} className="flex items-center gap-2 text-sm text-[#7B7A92] hover:text-[#2D2D3F]">
            <ChevronLeft className="w-4 h-4" /> All matches
          </button>
          <button className="text-[#7B7A92]">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-3xl mx-auto px-6 pt-4">
        <div className="rounded-2xl overflow-hidden bg-[#EAE6FF] h-64 mb-3">
          <img
            src={GALLERY[selectedImg]}
            alt="Salon interior"
            className="w-full h-full object-cover transition-all duration-300"
          />
        </div>
        <div className="flex gap-2">
          {GALLERY.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelectedImg(i)}
              className={`flex-1 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === selectedImg ? "border-[#6C63FF]" : "border-transparent"}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Title */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#2D2D3F]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Alchemy Studio
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <StarRating rating={4.9} />
              <span className="text-xs text-[#7B7A92]">· 412 reviews</span>
              <span className="text-xs text-[#7B7A92]">· 1.2 km away</span>
            </div>
          </div>
          <div className="bg-[#EAE6FF] text-[#6C63FF] text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> 97% Match
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[#7B7A92] leading-relaxed mb-6">
          Alchemy Studio is an award-winning salon in Indiranagar, Bangalore, known for its science-meets-art approach to hair and skincare. With a team of internationally trained stylists, we specialise in bespoke colour treatments, precision cuts, and result-driven facials.
        </p>

        {/* AI Summary */}
        <div
          className="rounded-2xl p-5 mb-6 flex gap-4"
          style={{ background: `linear-gradient(135deg, ${LAVENDER}, #FFF0E8)` }}
        >
          <Sparkles className="w-5 h-5 text-[#6C63FF] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#6C63FF] mb-1">AI Review Summary</p>
            <p className="text-sm text-[#2D2D3F] leading-relaxed">
              Clients consistently praise the thorough consultation process, attentive stylists, and long-lasting results. Balayage and keratin treatments receive the highest satisfaction scores. Wait times are minimal on weekday mornings.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#F8F7FF] p-1 rounded-xl mb-6">
          {(["services", "reviews"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === t ? "bg-white text-[#6C63FF] shadow-sm" : "text-[#7B7A92]"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {activeTab === "services" && (
          <div className="flex flex-col gap-3 mb-8">
            {SALON_SERVICES.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-4 bg-white border border-[#6C63FF]/08 rounded-2xl">
                <div>
                  <p className="text-sm font-semibold text-[#2D2D3F]">{s.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3 text-[#7B7A92]" />
                    <span className="text-xs text-[#7B7A92]">{s.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#2D2D3F]">₹{s.price.toLocaleString()}</span>
                  <button
                    onClick={() => toggleAddService({ name: s.name, duration: s.duration, price: s.price })}
                    className="text-xs text-[#6C63FF] font-medium border border-[#6C63FF]/25 px-3 py-1.5 rounded-lg hover:bg-[#EAE6FF] transition-colors"
                  >
                    {selectedServices.some((x) => x.name === s.name && x.salonId === Number(selectedSalon?.id)) ? "Added" : "Add"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="flex flex-col gap-4 mb-8">
            {DETAIL_REVIEWS.map((r) => (
              <div key={r.name} className="p-5 bg-white border border-[#6C63FF]/08 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: `linear-gradient(135deg, ${PURPLE}, ${ROSE})` }}
                  >
                    {r.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2D2D3F]">{r.name}</p>
                    <StarRating rating={r.rating} />
                  </div>
                  <span className="ml-auto text-xs text-[#7B7A92]">{r.time}</span>
                </div>
                <p className="text-sm text-[#7B7A92] leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 bg-white border-t border-[#6C63FF]/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-[#7B7A92]">Starting from</p>
            <p className="text-lg font-bold text-[#2D2D3F]">₹450</p>
          </div>
          <PrimaryButton onClick={() => go("booking")} className="px-10">
            Book Appointment
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 7. BOOKING
// ──────────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getMonthLabel(d: Date) {
  return d.toLocaleString("default", { month: "long", year: "numeric" });
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addMonths(d: Date, delta: number) {
  const nd = new Date(d);
  nd.setMonth(nd.getMonth() + delta);
  return nd;
}

function generateCalendarGrid(year: number, monthIndex: number) {
  // Returns 6 weeks x 7 days, with `null` for leading/trailing blanks.
  const first = new Date(year, monthIndex, 1);
  const firstWeekday = first.getDay(); // 0=Sun

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const grid: Array<Array<number | null>> = [];
  let current = 1 - firstWeekday;

  for (let w = 0; w < 6; w++) {
    const row: Array<number | null> = [];
    for (let i = 0; i < 7; i++) {
      if (current < 1 || current > daysInMonth) row.push(null);
      else row.push(current);
      current++;
    }
    grid.push(row);
  }

  return grid;
}


const TIME_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];
const UNAVAILABLE = [3, 6];

const BOOKING_SERVICES = [
  { name: "Haircut & Blowout", price: 1400 },
  { name: "Hydrating Facial", price: 2200 },
];

function BookingScreen({ go }: { go: (s: Screen) => void }) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>("10:00 AM");
  const [viewMonth, setViewMonth] = useState<Date>(() => new Date());


  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<Array<{ id: string; name: string; price: number; duration: string; salonId: number }>>([]);

  useEffect(() => {
    try {
      const rawSalon = window.localStorage.getItem("slotStyle:selectedSalon");
      if (rawSalon) setSelectedSalon(JSON.parse(rawSalon));
    } catch {
      // ignore
    }

    try {
      const rawServices = window.localStorage.getItem("slotStyle:selectedServices");
      if (rawServices) {
        const parsed = JSON.parse(rawServices);
        if (Array.isArray(parsed)) setSelectedServices(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const fee = 99;
  const subtotal = (selectedServices || []).reduce((sum, s) => sum + (Number.isFinite(Number(s.price)) ? Number(s.price) : 0), 0);
  const total = subtotal + fee;


  return (
    <div className="min-h-screen bg-[#F8F7FF]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="sticky top-0 z-40 bg-white border-b border-[#6C63FF]/10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => go("details")} className="p-2 rounded-xl bg-[#F8F7FF]">
            <ChevronLeft className="w-4 h-4 text-[#7B7A92]" />
          </button>
          <h1 className="text-base font-bold text-[#2D2D3F]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Book Your Appointment
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Salon info */}
        <div className="bg-white rounded-2xl p-5 border border-[#6C63FF]/08 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#EAE6FF]">
            <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop&auto=format" alt={selectedSalon?.name || "Salon"} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-[#2D2D3F]">{selectedSalon?.name || ""}</p>
            <p className="text-xs text-[#7B7A92]">{selectedSalon?.location || ""}</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl p-5 border border-[#6C63FF]/08">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#2D2D3F]">Select Date</h3>
            <div className="flex items-center gap-2">
              <button
                className="w-7 h-7 rounded-lg bg-[#F8F7FF] flex items-center justify-center"
                onClick={() => setViewMonth((m) => addMonths(m, -1))}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-[#7B7A92]" />
              </button>
              <span className="text-xs font-medium text-[#2D2D3F]">{getMonthLabel(viewMonth)}</span>
              <button
                className="w-7 h-7 rounded-lg bg-[#F8F7FF] flex items-center justify-center"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
              >
                <ChevronRight className="w-3.5 h-3.5 text-[#7B7A92]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-[#7B7A92] py-1">{d}</div>
            ))}
          </div>

          {(() => {
            const today = startOfDay(new Date());
            const grid = generateCalendarGrid(viewMonth.getFullYear(), viewMonth.getMonth());

            return grid.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((day, di) => {
                  if (!day) {
                    return (
                      <button
                        key={di}
                        disabled
                        className="aspect-square rounded-xl text-xs font-medium invisible"
                      />
                    );
                  }

                  const cellDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
                  const isPast = startOfDay(cellDate).getTime() < today.getTime();
                  const isSelected = selectedDay === day;

                  return (
                    <button
                      key={di}
                      disabled={isPast}
                      onClick={() => setSelectedDay(day)}
                      className={`aspect-square rounded-xl text-xs font-medium transition-all ${
                        isPast
                          ? "text-[#BBBBC8] cursor-not-allowed"
                          : isSelected
                            ? "text-white"
                            : "text-[#2D2D3F] hover:bg-[#EAE6FF]"
                      }`}
                      style={isSelected ? { background: `linear-gradient(135deg, ${PURPLE}, #9B94FF)` } : {}}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            ));
          })()}
        </div>

        {/* Time slots */}
        <div className="bg-white rounded-2xl p-5 border border-[#6C63FF]/08">
          <h3 className="text-sm font-bold text-[#2D2D3F] mb-4">
            Select Time{selectedDay ? ` · June ${selectedDay}, 2025` : ""}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot, i) => {
              const unavail = UNAVAILABLE.includes(i);
              const selected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  disabled={unavail}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                    unavail ? "border-[#E5E5EF] text-[#BBBBC8] cursor-not-allowed line-through" :
                    selected ? "border-[#6C63FF] text-white" :
                    "border-[#E5E5EF] text-[#2D2D3F] hover:border-[#6C63FF]/30"
                  }`}
                  style={selected ? { background: `linear-gradient(135deg, ${PURPLE}, #9B94FF)` } : {}}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Services */}
        <div className="bg-white rounded-2xl border border-[#6C63FF]/08 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#6C63FF]/08">
            <h3 className="text-sm font-bold text-[#2D2D3F]">Selected Services</h3>
          </div>
          {(selectedServices || []).map((s) => (
            <div key={`${s.id}-${s.name}`} className="px-5 py-3.5 flex items-center justify-between border-b border-[#6C63FF]/06">
              <p className="text-sm text-[#2D2D3F]">{s.name}</p>
              <span className="text-sm font-semibold text-[#2D2D3F]">₹{Number(s.price || 0).toLocaleString()}</span>
            </div>
          ))}
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#6C63FF]/06">
            <p className="text-sm text-[#7B7A92]">Platform fee</p>
            <span className="text-sm text-[#7B7A92]">₹{fee}</span>
          </div>
          <div className="px-5 py-4 flex items-center justify-between bg-[#F8F7FF]">
            <p className="text-sm font-bold text-[#2D2D3F]">Total</p>
            <span
              className="text-base font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${PURPLE}, ${ROSE})` }}
            >
              ₹{total.toLocaleString()}
            </span>
          </div>
        </div>

        <PrimaryButton
          fullWidth
          onClick={() => {
            try {
              const monthLabel = getMonthLabel(viewMonth);
              const year = viewMonth.getFullYear();

              window.localStorage.setItem(
                "slotStyle:bookingDetails",
                JSON.stringify({
                  salon: selectedSalon || null,
                  selectedServices: selectedServices || [],
                  date: selectedDay ? `${monthLabel} ${selectedDay}, ${year}` : null,
                  slot: selectedSlot,
                  total,
                })
              );
            } catch {
              // ignore
            }
            go("confirmation");
          }}
          disabled={!selectedDay || !selectedSlot || !selectedSalon}
          className="py-4 text-base"
        >
          <span className="flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" /> Confirm Booking
          </span>
        </PrimaryButton>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 8. CONFIRMATION
// ──────────────────────────────────────────────────────────────────────

function RescheduleScreen({ go }: { go: (s: Screen) => void }) {
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState<Date>(() => new Date());


  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("slotStyle:bookingDetails");
      if (raw) {
        const parsed = JSON.parse(raw);
        setBookingDetails(parsed || null);

        // bookingDetails.date is like "June 18, 2025"; extract day number.
        const dateStr = String(parsed?.date || "");
        const m = dateStr.match(/\b(\d{1,2})\b/);
        if (m) {
          const dayNum = Number(m[1]);
          if (Number.isFinite(dayNum)) setSelectedDay(dayNum);
        }

        setSelectedSlot(parsed?.slot ? String(parsed.slot) : null);
      }
    } catch {
      // ignore
    }
  }, []);

  const fee = 99;
  const subtotal = Array.isArray(bookingDetails?.selectedServices)
    ? bookingDetails.selectedServices.reduce((sum: number, s: any) => sum + (Number.isFinite(Number(s.price)) ? Number(s.price) : 0), 0)
    : 0;
  const total = subtotal + fee;

  return (
    <div className="min-h-screen bg-[#F8F7FF]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="sticky top-0 z-40 bg-white border-b border-[#6C63FF]/10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => go("confirmation")} className="p-2 rounded-xl bg-[#F8F7FF]">
            <ChevronLeft className="w-4 h-4 text-[#7B7A92]" />
          </button>
          <h1 className="text-base font-bold text-[#2D2D3F]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Reschedule Booking
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Salon info */}
        <div className="bg-white rounded-2xl p-5 border border-[#6C63FF]/08 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#EAE6FF]">
            <img
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop&auto=format"
              alt={bookingDetails?.salon?.name || "Salon"}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-bold text-[#2D2D3F]">{bookingDetails?.salon?.name || ""}</p>
            <p className="text-xs text-[#7B7A92]">{bookingDetails?.salon?.location || ""}</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl p-5 border border-[#6C63FF]/08">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#2D2D3F]">Select New Date</h3>
            <div className="flex items-center gap-2">
              <button
                className="w-7 h-7 rounded-lg bg-[#F8F7FF] flex items-center justify-center"
                onClick={() => setViewMonth((m) => addMonths(m, -1))}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-[#7B7A92]" />
              </button>
              <span className="text-xs font-medium text-[#2D2D3F]">{getMonthLabel(viewMonth)}</span>
              <button
                className="w-7 h-7 rounded-lg bg-[#F8F7FF] flex items-center justify-center"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
              >
                <ChevronRight className="w-3.5 h-3.5 text-[#7B7A92]" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-[#7B7A92] py-1">{d}</div>
            ))}
          </div>
          {(() => {
            const today = startOfDay(new Date());
            const grid = generateCalendarGrid(viewMonth.getFullYear(), viewMonth.getMonth());

            return grid.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((day, di) => {
                  if (!day) {
                    return (
                      <button
                        key={di}
                        disabled
                        className="aspect-square rounded-xl text-xs font-medium invisible"
                      />
                    );
                  }

                  const cellDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
                  const isPast = startOfDay(cellDate).getTime() < today.getTime();
                  const isSelected = selectedDay === day;

                  return (
                    <button
                      key={di}
                      disabled={isPast}
                      onClick={() => setSelectedDay(day)}
                      className={`aspect-square rounded-xl text-xs font-medium transition-all ${
                        isPast
                          ? "text-[#BBBBC8] cursor-not-allowed"
                          : isSelected
                            ? "text-white"
                            : "text-[#2D2D3F] hover:bg-[#EAE6FF]"
                      }`}
                      style={isSelected ? { background: `linear-gradient(135deg, ${PURPLE}, #9B94FF)` } : {}}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            ));
          })()}
        </div>

        {/* Time slots */}
        <div className="bg-white rounded-2xl p-5 border border-[#6C63FF]/08">
          <h3 className="text-sm font-bold text-[#2D2D3F] mb-4">
            Select New Time{selectedDay ? ` · June ${selectedDay}, 2025` : ""}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot, i) => {
              const unavail = UNAVAILABLE.includes(i);
              const selected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  disabled={unavail}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                    unavail ? "border-[#E5E5EF] text-[#BBBBC8] cursor-not-allowed line-through" :
                    selected ? "border-[#6C63FF] text-white" :
                    "border-[#E5E5EF] text-[#2D2D3F] hover:border-[#6C63FF]/30"
                  }`}
                  style={selected ? { background: `linear-gradient(135deg, ${PURPLE}, #9B94FF)` } : {}}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Services (summary only) */}
        <div className="bg-white rounded-2xl border border-[#6C63FF]/08 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#6C63FF]/08">
            <h3 className="text-sm font-bold text-[#2D2D3F]">Selected Services</h3>
          </div>
          {(bookingDetails?.selectedServices || []).map((s: any) => (
            <div key={s?.name} className="px-5 py-3.5 flex items-center justify-between border-b border-[#6C63FF]/06">
              <p className="text-sm text-[#2D2D3F]">{s?.name}</p>
              <span className="text-sm font-semibold text-[#2D2D3F]">₹{Number(s?.price || 0).toLocaleString()}</span>
            </div>
          ))}
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#6C63FF]/06">
            <p className="text-sm text-[#7B7A92]">Platform fee</p>
            <span className="text-sm text-[#7B7A92]">₹{fee}</span>
          </div>
          <div className="px-5 py-4 flex items-center justify-between bg-[#F8F7FF]">
            <p className="text-sm font-bold text-[#2D2D3F]">Total</p>
            <span
              className="text-base font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${PURPLE}, ${ROSE})` }}
            >
              ₹{total.toLocaleString()}
            </span>
          </div>
        </div>

        <PrimaryButton
          fullWidth
          onClick={() => {
            if (!selectedDay || !selectedSlot) return;
            try {
              window.localStorage.setItem(
                "slotStyle:bookingDetails",
                JSON.stringify({
                  ...bookingDetails,
                  date: `June ${selectedDay}, 2025`,
                  slot: selectedSlot,
                  total,
                })
              );
            } catch {
              // ignore
            }
            go("confirmation");
          }}
          disabled={!selectedDay || !selectedSlot}
          className="py-4 text-base"
        >
          <span className="flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" /> Save Changes
          </span>
        </PrimaryButton>

        {selectedDay && selectedSlot && (
          <p className="text-xs text-[#6C63FF] text-center">Booking successfully rescheduled.</p>
        )}
      </div>
    </div>
  );
}

function ConfirmationScreen({ go }: { go: (s: Screen) => void }) {
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("slotStyle:bookingDetails");
      if (raw) {
        const parsed = JSON.parse(raw);
        setBookingDetails(parsed || null);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${PURPLE}, #9B94FF)` }}
          >
            <Check className="w-10 h-10 text-white stroke-[2.5]" />
          </div>
          <div
            className="absolute -inset-2 rounded-full opacity-20 animate-ping"
            style={{ background: PURPLE }}
          />
        </div>

        <h1
          className="text-3xl font-bold text-[#2D2D3F] mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          You're all set!
        </h1>
        <p className="text-[#7B7A92] mb-10 leading-relaxed">
          Your appointment has been confirmed.
        </p>

        {/* Booking card */}
        <div className="bg-white border-2 border-[#EAE6FF] rounded-2xl overflow-hidden shadow-sm mb-8 text-left">
          <div
            className="px-6 py-4 text-white text-center"
            style={{ background: `linear-gradient(135deg, ${PURPLE}, #9B94FF)` }}
          >
            <p className="text-xs font-medium opacity-80 mb-1">Booking Confirmed</p>
            <p className="text-lg font-bold tracking-widest">SS-2025-004821</p>
          </div>
          <div className="px-6 py-5 flex flex-col gap-4">
            {[
              { label: "Salon", value: bookingDetails?.salon?.name || "" },
              { label: "Date", value: bookingDetails?.date || "" },
              { label: "Time", value: bookingDetails?.slot || "" },
              {
                label: "Services",
                value: Array.isArray(bookingDetails?.selectedServices)
                  ? bookingDetails.selectedServices.map((s) => s.name).join(", ")
                  : "",
              },
              {
                label: "Total Paid",
                value:
                  bookingDetails?.total !== undefined && bookingDetails?.total !== null
                    ? `₹${Number(bookingDetails.total).toLocaleString()}`
                    : "",
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between">
                <span className="text-xs text-[#7B7A92] pt-0.5">{label}</span>
                <span className="text-sm font-semibold text-[#2D2D3F] text-right max-w-[55%]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <PrimaryButton fullWidth onClick={() => go("listing")}>
            Explore More Salons
          </PrimaryButton>
          <GhostButton onClick={() => go("landing")} className="w-full">
            Back to Home
          </GhostButton>
        </div>

      <p className="text-xs text-[#7B7A92] mt-6">
          Need to reschedule?{" "}
          <button
            className="text-[#6C63FF] hover:underline"
            onClick={() => go("reschedule")}
          >
            Manage booking
          </button>
        </p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// ROOT
// ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");

  const go = (s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="size-full" style={{ scrollbarWidth: "none" }}>
      {screen === "login" && <LoginScreen go={go} />}
      {screen === "signup" && <SignupScreen go={go} />}
      {screen === "landing" && <LandingScreen go={go} />}
      {screen === "wizard" && <WizardScreen go={go} />}
      {screen === "ai-rec" && <AIRecScreen go={go} />}
      {screen === "listing" && <ListingScreen go={go} />}
      {screen === "details" && <DetailsScreen go={go} />}
      {screen === "booking" && <BookingScreen go={go} />}
      {screen === "confirmation" && <ConfirmationScreen go={go} />}
      {screen === "reschedule" && <RescheduleScreen go={go} />}
    </div>
  );
}

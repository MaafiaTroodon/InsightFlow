import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight, TrendingUp, Shield, Zap, BarChart3,
  Building2, DollarSign, Star,
} from 'lucide-react';
import { ThreeHero } from '../components/ThreeHero.jsx';
import { useAuth } from '../context/AuthContext.jsx';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { icon: TrendingUp, title: 'Financial Dashboard',    desc: 'Annual revenue tracking, margin analysis, cashflow forecasting and AI-generated summaries.', accent: 'brand'  },
  { icon: Building2,  title: 'Project Intelligence',   desc: 'Track every project with budget vs actual, risk scoring, milestone tracking and completion forecasting.', accent: 'gold'   },
  { icon: DollarSign, title: 'Accounts & Invoices',    desc: 'Invoice reconciliation, vendor spend analysis, overdue alerts and downloadable financial reports.', accent: 'sky'    },
  { icon: Zap,        title: 'AI Insights Engine',     desc: 'Rule-based anomaly detection flags budget overruns, delayed projects and vendor cost spikes automatically.', accent: 'violet' },
  { icon: BarChart3,  title: 'Advanced Analytics',     desc: 'Profitability heatmaps, scatter plots, quarterly comparisons and construction KPI benchmarking.', accent: 'success' },
  { icon: Shield,     title: 'Secure & Fast',          desc: 'JWT authentication, rate limiting, and audit trails — built for real-world production use.', accent: 'danger'  },
];

const ACCENTMAP = {
  brand:   'text-brand-400 bg-brand-500/10',
  gold:    'text-amber-400 bg-amber-500/10',
  sky:     'text-sky-400 bg-sky-500/10',
  violet:  'text-violet-400 bg-violet-500/10',
  success: 'text-emerald-400 bg-emerald-500/10',
  danger:  'text-rose-400 bg-rose-500/10',
};

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const featuresRef = useRef(null);
  const statsRef    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.feature-card',
        { opacity: 0, y: 40, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' } }
      );
      gsap.fromTo('.stat-card',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, stagger: 0.12, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: statsRef.current, start: 'top 85%' } }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-canvas overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 py-4 glass border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 ring-1 ring-brand-400/20">
            <Building2 className="h-4 w-4 text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">InsightFlow AI</p>
            <p className="text-[10px] text-slate-500">Construction Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/app/executive" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500">
              Open Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link to="/login"    className="text-sm font-semibold text-slate-400 hover:text-white transition">Login</Link>
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute top-1/3 left-1/4 h-[600px] w-[600px] rounded-full bg-brand-950/25 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-amber-950/10 blur-[100px] pointer-events-none" />
        <ThreeHero />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/8 px-4 py-1.5 text-xs font-semibold text-brand-400">
              <Star className="h-3 w-3" />
              Enterprise Construction Intelligence Platform
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span className="gradient-brand">Construction</span>
            <br />
            <span className="text-white">intelligence</span>
            <br />
            <span className="gradient-gold">at scale.</span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            All your project finances, invoices, and site reports — in one place.
            Upload your data and get instant analysis.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
          >
            <Link
              to={isAuthenticated ? '/app/executive' : '/register'}
              className="btn-mag inline-flex items-center gap-2.5 rounded-2xl bg-brand-600 px-7 py-3.5 text-base font-bold text-white shadow-[0_0_40px_rgba(31,176,170,0.3)] transition hover:bg-brand-500"
            >
              {isAuthenticated ? 'Open Dashboard' : 'Get Started'}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/upload"
              className="btn-mag inline-flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Upload CSV Data
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-14 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}
          >
            {[['$58M+', 'Revenue tracked'], ['6', 'Live projects'], ['84', 'Health score'], ['23.2%', 'Avg margin']].map(([v, l]) => (
              <div key={l} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-3 text-center backdrop-blur">
                <p className="text-xl font-black text-white">{v}</p>
                <p className="text-xs text-slate-500">{l}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
          animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="h-8 w-5 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <div className="h-1.5 w-1 rounded-full bg-brand-400 animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="py-24 px-6 bg-dots">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Everything you need to run<br />your construction business</h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">From financial overview to project-level drill-downs and site reports — built around your workflow.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card glass-card rounded-2xl p-6 border border-white/[0.07] hover:border-brand-500/20 transition-all duration-300 opacity-0">
                <div className={`h-10 w-10 rounded-xl ${ACCENTMAP[f.accent]} flex items-center justify-center mb-4`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section ref={statsRef} className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="glass-card rounded-3xl p-10 border border-brand-500/15">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-white">The platform your $60M company needs today</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {[['$58M+','Revenue Monitored','text-brand-400'],['6','Active Projects','text-amber-400'],['23.2%','Avg Profit Margin','text-emerald-400'],['< 5s','Dashboard Load','text-sky-400']].map(([v,l,c]) => (
                <div key={l} className="stat-card opacity-0">
                  <p className={`text-3xl font-black ${c}`}>{v}</p>
                  <p className="text-xs text-slate-500 mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="glass-card rounded-3xl p-12 border border-brand-500/15 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-brand-950/40 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-white mb-4">Ready to modernize your operations?</h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">Upload your first CSV in 60 seconds. No credit card required.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to={isAuthenticated ? '/app/executive' : '/register'}
                  className="btn-mag inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-8 py-3.5 text-base font-bold text-white shadow-[0_0_40px_rgba(31,176,170,0.3)] hover:bg-brand-500 transition">
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'} <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/upload"
                  className="btn-mag inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition">
                  Upload CSV
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 px-6 text-center text-xs text-slate-600">
        © 2025 InsightFlow AI · Construction Intelligence Platform
      </footer>
    </div>
  );
}

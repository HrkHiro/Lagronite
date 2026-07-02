import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import schoolLogo from '../../assets/school-logo.png'

const features = [
  {
    title: 'Report Items',
    description: 'Submit lost and found reports with photos, descriptions, dates, and locations.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Smart Matching',
    description: 'Compare item details to identify possible matches between lost and found reports.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Recovery Tracking',
    description: 'Monitor item status from Lost to Returned through one centralized platform.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M3 12a9 9 0 1 0 9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M3 12V6m0 6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const workflowSteps = [
  { step: '01', title: 'Report Lost Item', description: 'Student enters details: item name, category, color, description, date, and location where it was lost.' },
  { step: '02', title: 'Report Found Item', description: 'Another student or staff submits a found item with similar information through the platform.' },
  { step: '03', title: 'Automatic Matching', description: 'System compares details and generates possible matches based on category, color, description, location, and date.' },
  { step: '04', title: 'Claim Request', description: 'Owner reviews matches and submits a claim request for a found item.' },
  { step: '05', title: 'Verification and Return', description: 'Admin verifies ownership through proof or ID, updates the item status to Returned, and stores the record.' },
]

const studentFunctions = [
  'Create account and log in',
  'Submit lost item reports',
  'Submit found item reports',
  'Search and view reported items',
  'Receive possible item match suggestions',
  'Submit a claim request for found item',
  'View status of their reports',
]

const adminFunctions = [
  'Manage student accounts',
  'Review lost and found reports',
  'Verify item ownership',
  'Approve or reject item claims',
  'Update item status: Lost, Found, Claimed, Returned',
  'Generate reports and statistics',
  'Manage database of items',
]

export function Home() {
  const [particles, setParticles] = useState([])

  // Generate static particles once on mount (allowed side effect)
  useEffect(() => {
    const newParticles = [...Array(18)].map(() => {
      const size = 2 + Math.random() * 4
      const x = 5 + Math.random() * 90
      const y = 5 + Math.random() * 90
      const duration = 12 + Math.random() * 18
      const delay = Math.random() * 10
      const tx = -20 + Math.random() * 40
      const ty = -20 + Math.random() * 40
      return { size, x, y, duration, delay, tx, ty }
    })
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(newParticles)
  }, [])

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    )

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <style>{`
        /* ─── KEYFRAMES ─── */
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.92) rotate(-1deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes floatX {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(8px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.15); }
        }
        @keyframes glowPulseFast {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes shine {
          from { transform: translateX(-120%) skewX(-15deg); }
          to { transform: translateX(220%) skewX(-15deg); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes dotDrift {
          from { background-position: 0 0; }
          to { background-position: 80px 80px; }
        }
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(10px); opacity: 1; }
        }
        @keyframes badgeSheen {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        @keyframes particleFloat {
          0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        @keyframes shimmerPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.15); }
          50% { box-shadow: 0 0 60px rgba(16,185,129,0.3); }
        }
        @keyframes textReveal {
          0% { clip-path: inset(0 100% 0 0); }
          100% { clip-path: inset(0 0 0 0); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ─── ANIMATION CLASSES ─── */
        .anim-rise { animation: riseIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .anim-scale { animation: fadeScaleIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .glow-a { animation: glowPulse 8s ease-in-out infinite; }
        .glow-b { animation: glowPulse 9s ease-in-out infinite 1.5s; }
        .glow-c { animation: glowPulseFast 6s ease-in-out infinite 3s; }
        .float-card { animation: floatY 6s ease-in-out infinite; }
        .float-card-2 { animation: floatY 7s ease-in-out infinite 1s; }
        .gradient-text {
          background-size: 200% auto;
          animation: gradientShift 5s ease-in-out infinite;
        }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 32px 32px;
          animation: dotDrift 18s linear infinite;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
        .scroll-cue { animation: bounceDown 2.2s ease-in-out infinite; }
        .shine-btn {
          position: relative;
          overflow: hidden;
        }
        .shine-btn::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: translateX(-120%) skewX(-15deg);
        }
        .shine-btn:hover::after { animation: shine 0.85s ease forwards; }
        .badge-pill {
          position: relative;
          overflow: hidden;
        }
        .badge-pill::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 30%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(52,211,153,0.35), transparent);
          transform: translateX(-100%);
          animation: badgeSheen 3.5s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        .card-hover {
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, border-color 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-6px) scale(1.01);
          border-color: rgba(52,211,153,0.35);
          box-shadow: 0 16px 50px -20px rgba(52,211,153,0.25);
        }
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .animate-on-scroll.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .animate-on-scroll:nth-child(2) { transition-delay: 0.1s; }
        .animate-on-scroll:nth-child(3) { transition-delay: 0.2s; }
        .animate-on-scroll:nth-child(4) { transition-delay: 0.3s; }
        .animate-on-scroll:nth-child(5) { transition-delay: 0.4s; }
        .particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: particleFloat var(--duration) ease-in-out infinite alternate;
          animation-delay: var(--delay);
        }
        .shimmer-card {
          position: relative;
          overflow: hidden;
        }
        .shimmer-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 40%, rgba(16,185,129,0.03), transparent 70%);
          animation: rotateSlow 20s linear infinite;
        }
        .glow-btn {
          animation: shimmerPulse 3s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .anim-rise, .anim-scale, .glow-a, .glow-b, .glow-c, .float-card, .float-card-2,
          .gradient-text, .dot-grid, .scroll-cue, .badge-pill::after,
          .animate-on-scroll, .particle, .glow-btn {
            animation: none !important;
          }
          .animate-on-scroll {
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* ─── PARTICLES ─── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: i % 3 === 0 ? 'rgba(16,185,129,0.3)' : i % 3 === 1 ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.1)',
              '--duration': `${p.duration}s`,
              '--delay': `${p.delay}s`,
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
              filter: `blur(${i % 2 === 0 ? 0 : 1}px)`,
            }}
          />
        ))}
      </div>

      {/* ─── DOT GRID ─── */}
      <div className="dot-grid pointer-events-none absolute inset-0" />

      {/* ─── GLOW ORBS ─── */}
      <div className="glow-a absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.07] blur-[180px]" />
      <div className="glow-b absolute -right-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.07] blur-[180px]" />
      <div className="glow-c absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/[0.04] blur-[120px]" />

      {/* ─── HERO SECTION ─── */}
      <div className="relative z-10 mx-auto flex max-w-7xl items-center px-6 py-16 md:px-10 lg:py-20">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">

          {/* LEFT SIDE */}
          <div>
            <div
              className="anim-rise badge-pill inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 backdrop-blur-xl"
              style={{ animationDelay: '0.05s' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-sm font-medium text-emerald-300">
                Smart Lost and Found Platform
              </span>
            </div>

            <h1
              className="anim-rise mt-6 text-4xl font-black leading-[1.1] md:text-5xl lg:text-6xl"
              style={{ animationDelay: '0.15s' }}
            >
              Lost Something?
              <span className="gradient-text block bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Find It Faster.
              </span>
            </h1>

            <p
              className="anim-rise mt-5 max-w-xl text-base leading-7 text-slate-300 lg:text-lg lg:leading-8"
              style={{ animationDelay: '0.28s' }}
            >
              Lagronite helps students and administrators report,
              match, and recover lost belongings through a centralized
              digital platform designed specifically for school
              environments.
            </p>

            <div
              className="anim-rise mt-8 flex flex-wrap gap-4"
              style={{ animationDelay: '0.4s' }}
            >
              <Link
                to="/register"
                className="shine-btn glow-btn rounded-2xl bg-emerald-500 px-8 py-3.5 font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-emerald-400 hover:shadow-[0_0_0_4px_rgba(16,185,129,0.15),0_0_50px_rgba(16,185,129,0.5)]"
              >
                Get Started
              </Link>

              <Link
                to="/login"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-3.5 font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-white/20 hover:bg-white/10"
              >
                Login
              </Link>
            </div>

            {/* FEATURES */}
            <div className="mt-12 grid gap-4 sm:grid-cols-3 lg:mt-14">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="anim-rise card-hover shimmer-card group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                  style={{ animationDelay: `${0.52 + i * 0.1}s` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/20">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400 lg:leading-7">
                    {feature.description}
                  </p>
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300 group-hover:w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="relative mx-auto w-full max-w-[560px] lg:mx-0 lg:ml-auto">
            <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-emerald-500/10 blur-[140px]" />

            <div className="relative z-10 float-card">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
                <img
                  src={schoolLogo}
                  alt="Lagro High School campus"
                  className="h-[360px] w-full object-cover object-[50%_38%] md:h-[420px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="absolute bottom-0 left-0 flex w-full items-center justify-between px-6 py-5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-emerald-300/90">
                      Lagro High School
                    </p>
                    <h4 className="font-semibold text-white">Our Campus</h4>
                  </div>
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="float-card-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 backdrop-blur-xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] hover:border-emerald-400/30 transition-all duration-300 hover:-translate-y-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                    <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Smart Matching</p>
                  <h4 className="font-semibold text-white">Auto Compare Items</h4>
                </div>
              </div>

              <div className="float-card-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 backdrop-blur-xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] hover:border-cyan-400/30 transition-all duration-300 hover:-translate-y-1" style={{ animationDelay: '0.5s' }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M3 12a9 9 0 1 0 9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M3 12V6m0 6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Recovery Tracking</p>
                  <h4 className="font-semibold text-white">Lost to Returned</h4>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs text-emerald-300 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span>Live • 24/7 monitoring</span>
              <span className="ml-1 text-emerald-400/50">|</span>
              <span className="font-mono text-emerald-400">42</span>
              <span className="text-emerald-400/60">active reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM SECTIONS ─── */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20 md:px-10">
        {/* Workflow */}
        <div className="animate-on-scroll rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                How The System Works
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
                From report to return
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-400">
              Lagronite gives Lagro High School a clear process for recording,
              matching, claiming, verifying, and returning lost belongings.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-5">
            {workflowSteps.map((item, i) => (
              <div
                key={item.step}
                className="animate-on-scroll card-hover group rounded-2xl border border-white/10 bg-slate-950/60 p-5 transition duration-300"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-sm font-bold text-emerald-300 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-400/20">
                  {item.step}
                </span>
                <h3 className="mt-5 text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
                <span className="mt-5 block h-0.5 w-10 rounded-full bg-emerald-400/40 transition-all duration-300 group-hover:w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Student & Admin Functions */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="animate-on-scroll rounded-[2.5rem] border border-white/10 bg-slate-900/65 p-6 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                  <path d="M10 1v4M6 3l2 2M14 3l-2 2M3 10h4M17 10h-4M6 17l2-2M14 17l-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                Student Functions
              </p>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white">Tools for students</h2>
            <div className="mt-6 grid gap-2.5">
              {studentFunctions.map((item, i) => (
                <div
                  key={item}
                  className="animate-on-scroll flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300 transition hover:bg-white/[0.08] hover:border-cyan-400/20"
                  style={{ transitionDelay: `${i * 0.05}s` }}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-xs text-cyan-200 transition-transform duration-300 hover:scale-110">
                    <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
                      <path d="M5 10.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-on-scroll rounded-[2.5rem] border border-white/10 bg-slate-900/65 p-6 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                  <path d="M10 1v4M6 3l2 2M14 3l-2 2M3 10h4M17 10h-4M6 17l2-2M14 17l-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Administrator Functions
              </p>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white">Tools for administrators</h2>
            <div className="mt-6 grid gap-2.5">
              {adminFunctions.map((item, i) => (
                <div
                  key={item}
                  className="animate-on-scroll flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300 transition hover:bg-white/[0.08] hover:border-emerald-400/20"
                  style={{ transitionDelay: `${i * 0.05}s` }}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-xs text-emerald-200 transition-transform duration-300 hover:scale-110">
                    <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
                      <path d="M5 10.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="animate-on-scroll mt-6 rounded-[2.5rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 p-8 text-center backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(16,185,129,0.1)]">
          <h3 className="text-2xl font-bold text-white">Ready to get started?</h3>
          <p className="mt-2 text-sm text-slate-400">Join Lagronite today and help build a more connected campus community.</p>
          <Link
            to="/register"
            className="shine-btn glow-btn mt-6 inline-block rounded-2xl bg-emerald-500 px-10 py-3.5 font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-emerald-400 hover:shadow-[0_0_0_4px_rgba(16,185,129,0.15),0_0_50px_rgba(16,185,129,0.4)]"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      {/* ─── SCROLL CUE ─── */}
      <div className="scroll-cue absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-slate-500">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  )
}
"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Palette, Brain, Database, Play, CheckCircle2, Star, Twitter, Github, Linkedin, Globe } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <main ref={containerRef} className="min-h-screen bg-[#050505] text-white flex flex-col items-center relative overflow-hidden selection:bg-teal-500/30 font-sans">

      {/* --------------------------------------------------------------------------------
         GLOBAL AMBIENCE
      -------------------------------------------------------------------------------- */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/10 via-[#050505] to-[#050505] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0" />

      {/* --------------------------------------------------------------------------------
         HERO SECTION (Enhanced)
      -------------------------------------------------------------------------------- */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 pt-20 z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono tracking-[0.3em] text-teal-300 mb-8 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          REVOLUTIONIZING NO-CODE
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-9xl font-black font-serif text-center tracking-tighter mb-8 leading-[0.9]"
        >
          Build the <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-white to-amber-200">Future.</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-white to-amber-500 opacity-80 text-5xl md:text-8xl">
            No Code Required.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-2xl text-gray-400 max-w-3xl text-center font-light leading-relaxed mb-12"
        >
          The ultimate Operating System to design, build, and launch portfolios,
          SaaS, and E-commerce platforms with Shopify power and Figma precision.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 mb-24"
        >
          <Link href="/designer">
            <button className="group relative px-10 py-5 bg-teal-500 text-black font-bold text-xl rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-5px_rgba(45,212,191,0.5)]">
              <div className="absolute inset-0 bg-white/40 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-500 ease-out" />
              <div className="relative flex items-center gap-2">
                Start Building <ArrowRight size={20} />
              </div>
            </button>
          </Link>
          <button className="px-10 py-5 bg-white/5 border border-white/10 text-white font-semibold text-xl rounded-full hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-sm">
            <Play size={20} fill="currentColor" /> Watch 2min Demo
          </button>
        </motion.div>
      </section>

      {/* --------------------------------------------------------------------------------
         TRUSTED BY MARQUEE
      -------------------------------------------------------------------------------- */}
      <section className="w-full border-y border-white/5 bg-black/50 backdrop-blur-sm z-10 overflow-hidden py-10">
        <div className="max-w-7xl mx-auto px-4 text-center mb-6 text-sm font-mono text-gray-500 tracking-widest uppercase">
          Powering next-gen startups
        </div>
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex gap-20 items-center">
            {/* Duplicated LOGOS for infinite scroll effect */}
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex gap-20 items-center opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <h3 className="text-2xl font-black font-serif tracking-tighter">VERCEL</h3>
                <h3 className="text-2xl font-black font-serif tracking-tighter">STRIPE</h3>
                <h3 className="text-2xl font-black font-serif tracking-tighter">FIGMA</h3>
                <h3 className="text-2xl font-black font-serif tracking-tighter">SHOPIFY</h3>
                <h3 className="text-2xl font-black font-serif tracking-tighter">OPENAI</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         DEEP DIVE 1: INFINITE CANVAS
      -------------------------------------------------------------------------------- */}
      <FeatureDeepDive
        align="right"
        title="Infinite Canvas."
        subtitle="DESIGN WITHOUT LIMITS"
        desc="Forget rigid templates. Our physics-based layout engine lets you drag, drop, and snap elements with sub-pixel precision. It feels like a design tool, but writes clean React code."
        icon={<Palette className="w-8 h-8 text-teal-400" />}
        gradient="from-teal-500/20 to-blue-500/20"
        features={['Auto-Layout Support', 'Component Variants', 'Real-time Collaboration']}
        imagePlaceholder={
          <div className="w-full h-full bg-gradient-to-br from-teal-900/40 to-black border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="w-3/4 h-3/4 bg-[#0A0A0A] rounded-xl border border-white/10 shadow-2xl flex flex-col p-4 group-hover:scale-105 transition-transform duration-700">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                <div className="w-3 h-3 rounded-full bg-green-500/20" />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="bg-teal-500/10 rounded-lg animate-pulse" />
                <div className="bg-white/5 rounded-lg" />
                <div className="bg-white/5 rounded-lg col-span-2 h-20" />
              </div>
            </div>
          </div>
        }
      />

      {/* --------------------------------------------------------------------------------
         DEEP DIVE 2: VISUAL LOGIC
      -------------------------------------------------------------------------------- */}
      <FeatureDeepDive
        align="left"
        title="Visual Logic."
        subtitle="NO SPAGHETTI CODE"
        desc="Build complex backend logic by connecting nodes. Auth flows, payment gateways, and API integrations are pre-built. Just connect the dots."
        icon={<Brain className="w-8 h-8 text-purple-400" />}
        gradient="from-purple-500/20 to-pink-500/20"
        features={['Node-Based Editor', 'One-Click Auth', 'Serverless Functions']}
        imagePlaceholder={
          <div className="w-full h-full bg-gradient-to-bl from-purple-900/40 to-black border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            {/* Node visualization */}
            <div className="absolute top-1/3 left-1/4 w-32 h-20 bg-[#111] border border-purple-500/50 rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)] z-10">
              <span className="text-xs font-mono text-purple-300">User Login</span>
            </div>
            <div className="absolute bottom-1/3 right-1/4 w-32 h-20 bg-[#111] border border-pink-500/50 rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.3)] z-10">
              <span className="text-xs font-mono text-pink-300">Redirect Dashboard</span>
            </div>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path d="M 200 200 C 300 200, 300 400, 400 400" stroke="white" strokeOpacity="0.2" strokeWidth="2" fill="none" strokeDasharray="10 5" className="animate-[dash_20s_linear_infinite]" />
            </svg>
          </div>
        }
      />

      {/* --------------------------------------------------------------------------------
         DEEP DIVE 3: GLOBAL MEMORY
      -------------------------------------------------------------------------------- */}
      <FeatureDeepDive
        align="right"
        title="Global Memory."
        subtitle="DATABASE MADE EASY"
        desc="A relational database that feels like a spreadsheet. Real-time sync, automated backups, and instant API generation for all your data."
        icon={<Database className="w-8 h-8 text-blue-400" />}
        gradient="from-blue-500/20 to-indigo-500/20"
        features={['Real-Time Sync', 'Auto-API Generation', 'Edge Caching']}
        imagePlaceholder={
          <div className="w-full h-full bg-gradient-to-tr from-blue-900/40 to-black border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="w-3/4 h-3/4 bg-[#0A0A0A] rounded-xl border border-white/10 flex flex-col p-6 group-hover:scale-105 transition-transform duration-700">
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <span className="text-xs font-mono text-blue-400">TABLE: USERS</span>
                <div className="flex gap-2">
                  <div className="w-20 h-2 bg-white/10 rounded" />
                </div>
              </div>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4 mb-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-white/5" />
                  <div className="flex-1 h-2 bg-white/5 rounded" />
                  <div className="w-1/4 h-2 bg-blue-500/20 rounded" />
                </div>
              ))}
            </div>
          </div>
        }
      />

      {/* --------------------------------------------------------------------------------
         IMPACT METRICS
      -------------------------------------------------------------------------------- */}
      <section className="w-full border-y border-white/10 bg-white/[0.02] backdrop-blur-sm z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <MetricItem label="Components" value="5,000+" />
          <MetricItem label="Users" value="10k+" />
          <MetricItem label="Uptime" value="99.99%" />
          <MetricItem label="Revenue Gen" value="$500M+" />
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         TESTIMONIALS
      -------------------------------------------------------------------------------- */}
      <section className="w-full max-w-7xl px-4 py-32 z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono tracking-widest mb-4">
            COMMUNITY LOVE
          </div>
          <h2 className="text-4xl md:text-6xl font-black font-serif mb-4">Loved by Builders</h2>
          <p className="text-gray-400 text-xl font-light">Join 10,000+ creators building the web of tomorrow.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <TestimonialCard
            quote="I fired my entire engineering team. Omni-OS lets me build features 10x faster than writing code."
            author="Alex Chen"
            role="Founder, TechFlow"
            stars={5}
          />
          <TestimonialCard
            quote="The design tools are actually better than Figma. Being able to ship directly to production is magic."
            author="Sarah Jones"
            role="Product Designer"
            stars={5}
          />
          <TestimonialCard
            quote="Finally, a no-code tool that produces clean, semantic HTML. My SEO scores have never been higher."
            author="Mike Ross"
            role="SEO Specialist"
            stars={5}
          />
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         PRICING
      -------------------------------------------------------------------------------- */}
      <section className="w-full max-w-7xl px-4 py-32 z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black font-serif mb-6">Simple Pricing</h2>
          <p className="text-xl text-gray-400">Start for free, scale as you grow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard
            tier="STARTER"
            price="$0"
            features={['1 Project', 'Basic Analytics', 'Community Support']}
          />
          <PricingCard
            tier="PRO"
            price="$29"
            features={['Unlimited Projects', 'Custom Domains', 'Priority Support', 'Advanced Analytics']}
            popular
          />
          <PricingCard
            tier="ENTERPRISE"
            price="Custom"
            features={['SSO & Audit Logs', 'Dedicated Success Manager', 'SLA Uptime', 'On-Premise Deployment']}
          />
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         FAQ
      -------------------------------------------------------------------------------- */}
      <section className="w-full max-w-4xl px-4 py-32 z-10">
        <h2 className="text-4xl md:text-5xl font-black font-serif mb-12 text-center">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          <FAQItem question="Do I own the code?" answer="Yes. You can export clean, semantic React code at any time. No lock-in." />
          <FAQItem question="Is it SEO friendly?" answer="Absolutely. We generate server-side rendered (SSR) pages that Google loves." />
          <FAQItem question="Can I connect my own database?" answer="Yes, we support PostgreSQL, MySQL, and Supabase integration out of the box." />
          <FAQItem question="What happens if I cancel?" answer="Your site stays live forever. You just lose access to the visual editor." />
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         FOOTER
      -------------------------------------------------------------------------------- */}
      <footer className="w-full border-t border-white/10 bg-[#020202] z-10 pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-20 mb-20">
          <div className="flex-1">
            <div className="text-2xl font-black font-serif tracking-tighter text-white mb-6">OMNI-OS</div>
            <p className="text-gray-500 max-w-xs mb-8">
              The operating system for the next generation of web builders. Design, Logic, Database - all in one.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Twitter size={20} />} />
              <SocialIcon icon={<Github size={20} />} />
              <SocialIcon icon={<Linkedin size={20} />} />
            </div>
          </div>

          <FooterColumn title="Product" links={['Features', 'Templates', 'Integrations', 'Pricing', 'Changelog']} />
          <FooterColumn title="Resources" links={['Documentation', 'Community', 'Academy', 'Help Center']} />
          <FooterColumn title="Company" links={['About', 'Careers', 'Blog', 'Contact']} />
          <div className="flex-1">
            <h4 className="font-bold mb-6">Stay Updated</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Enter your email" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-teal-500/50" />
              <button className="bg-teal-500 text-black font-bold px-4 py-2 rounded-lg hover:bg-teal-400 transition-colors">Go</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <p>© 2026 OMNI-OS Inc. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

    </main>
  );
}

/* --------------------------------------------------------------------------------
   HELPER COMPONENTS
-------------------------------------------------------------------------------- */

function FeatureDeepDive({ align, title, subtitle, desc, icon, gradient, features, imagePlaceholder }: any) {
  return (
    <section className="w-full max-w-7xl px-4 py-32 z-10">
      <div className={`flex flex-col ${align === 'right' ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16`}>

        {/* Text Side */}
        <motion.div
          initial={{ opacity: 0, x: align === 'right' ? -50 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-1"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} border border-white/10`}>
              {icon}
            </div>
            <span className="text-sm font-mono tracking-widest text-gray-400 uppercase">{subtitle}</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black font-serif mb-6 leading-none">{title}</h2>
          <p className="text-xl text-gray-400 font-light leading-relaxed mb-10">
            {desc}
          </p>

          <ul className="space-y-4">
            {features.map((f: string, i: number) => (
              <li key={i} className="flex items-center gap-4 text-lg">
                <CheckCircle2 className="text-teal-500 w-6 h-6" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Image Side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-1 w-full h-[500px]"
        >
          {imagePlaceholder}
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialCard({ quote, author, role, stars }: any) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex gap-1 mb-6 text-amber-400">
        {[...Array(stars)].map((_, i) => <Star key={i} fill="currentColor" size={16} />)}
      </div>

      <p className="text-lg leading-relaxed mb-8 text-gray-200">"{quote}"</p>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-black border border-white/10" />
        <div>
          <div className="font-bold">{author}</div>
          <div className="text-sm text-gray-400">{role}</div>
        </div>
      </div>
    </motion.div>
  )
}

function FooterColumn({ title, links }: any) {
  return (
    <div>
      <h4 className="font-bold mb-6">{title}</h4>
      <ul className="space-y-4 text-gray-400">
        {links.map((link: string) => (
          <li key={link}><a href="#" className="hover:text-teal-400 transition-colors">{link}</a></li>
        ))}
      </ul>
    </div>
  )
}

function SocialIcon({ icon }: any) {
  return (
    <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:scale-110 transition-all">
      {icon}
    </a>
  )
}

function MetricItem({ label, value }: any) {
  return (
    <div className="p-6">
      <div className="text-4xl md:text-5xl font-black font-serif text-white mb-2">{value}</div>
      <div className="text-gray-500 font-mono text-sm tracking-widest uppercase">{label}</div>
    </div>
  )
}

function PricingCard({ tier, price, features, popular }: any) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className={`p-8 rounded-3xl bg-white/5 border ${popular ? 'border-teal-500 shadow-[0_0_30px_-5px_rgba(45,212,191,0.3)]' : 'border-white/10'} backdrop-blur-md relative flex flex-col`}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-teal-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
          MOST POPULAR
        </div>
      )}
      <div className="text-sm font-mono text-gray-400 mb-4">{tier}</div>
      <div className="text-5xl font-black font-serif text-white mb-8">{price}</div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-3 text-gray-300">
            <CheckCircle2 size={18} className="text-teal-500" />
            {f}
          </li>
        ))}
      </ul>
      <button className={`w-full py-4 rounded-xl font-bold transition-all ${popular ? 'bg-teal-500 text-black hover:bg-teal-400' : 'bg-white/10 text-white hover:bg-white/20'}`}>
        Get Started
      </button>
    </motion.div>
  )
}

function FAQItem({ question, answer }: any) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden cursor-pointer"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="p-6 flex justify-between items-center">
        <h3 className="text-xl font-bold">{question}</h3>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
          <ArrowRight size={20} className="text-gray-400 w-5 h-5" />
        </div>
      </div>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5">
          {answer}
        </div>
      </motion.div>
    </div>
  )
}

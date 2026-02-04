import { FadeIn, GlassContainer } from "@/components/ui/framer-shell";
import { Shield, Brain, Activity, FileCheck, Layers, Terminal } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-6 sm:p-24 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-6xl space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-12">
          <FadeIn>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-sm font-semibold tracking-widest text-blue-400 uppercase">Enterprise OS</h2>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-slate-50 via-slate-200 to-slate-400 bg-clip-text text-transparent italic">
              AuditAgent <span className="not-italic opacity-50 font-light">OS</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2} className="flex gap-4">
            <div className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">Systems Operational</span>
            </div>
          </FadeIn>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FadeIn delay={0.3}>
            <GlassContainer className="h-full">
              <div className="space-y-4">
                <div className="p-2 w-fit bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold">ISA Intelligence</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Real-time reasoning based on ISA 230, 240, and 315 standards. Automated fraud detection and risk assessment protocols.
                </p>
              </div>
            </GlassContainer>
          </FadeIn>

          <FadeIn delay={0.4}>
            <GlassContainer className="h-full">
              <div className="space-y-4">
                <div className="p-2 w-fit bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <Activity className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold">Continuous Audit</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Live data streaming through Supabase PostgreSQL, ensuring all materialized misstatements are spotted instantly.
                </p>
              </div>
            </GlassContainer>
          </FadeIn>

          <FadeIn delay={0.5}>
            <GlassContainer className="h-full">
              <div className="space-y-4">
                <div className="p-2 w-fit bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <FileCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">Autonomous Compliance</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Automated documentation generation and review workflows designed for production-ready enterprise environments.
                </p>
              </div>
            </GlassContainer>
          </FadeIn>
        </div>

        <FadeIn delay={0.6}>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-1 w-full">
              <div className="bg-slate-950/80 rounded-[22px] flex flex-col md:flex-row items-center p-8 gap-12">
                <div className="flex-1 space-y-4">
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-[0.3em]">Module Engine</span>
                  <h2 className="text-3xl font-bold">Initialize Project Materials</h2>
                  <p className="text-slate-400 max-w-md">
                    Deploy your modular audit architecture instantly. Integrated with Gemini 1.5 Pro for advanced reasoning.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-blue-400 transition-all active:scale-95 shadow-[0_0_30px_-5px_white/20]">
                    Launch Dashboard
                  </button>
                  <button className="px-8 py-4 bg-slate-800 border border-slate-700 font-bold rounded-2xl hover:bg-slate-700 transition-all active:scale-95">
                    View ISA Docs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <footer className="pt-12 flex flex-col sm:flex-row items-center justify-between border-t border-white/5 gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-500">
              <Terminal className="w-4 h-4" />
              <span className="text-[10px] font-mono tracking-tighter uppercase">Kernel: v15.0-production</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Layers className="w-4 h-4" />
              <span className="text-[10px] font-mono tracking-tighter uppercase">Tier: Enterprise SaaS</span>
            </div>
          </div>
          <p className="text-[10px] font-mono tracking-widest text-slate-600 uppercase">
            © 2026 AuditAgent Technologies. Secure Core.
          </p>
        </footer>
      </div>
    </main>
  );
}

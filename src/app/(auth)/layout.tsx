import Link from "next/link";
import { BrainCircuit, BarChart3, ShoppingBasket, TrendingUp } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            {/* Left panel - branding with visuals */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/90 via-primary to-purple-700 items-center justify-center p-12 overflow-hidden">
                {/* Dot grid pattern */}
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)", backgroundSize: "32px 32px"}} />

                {/* Floating decorative orbs */}
                <div className="absolute w-[300px] h-[300px] rounded-full bg-white/5 -top-20 -right-20 blur-2xl" style={{animation: "float 8s ease-in-out infinite"}} />
                <div className="absolute w-[200px] h-[200px] rounded-full bg-white/5 bottom-20 -left-20 blur-2xl" style={{animation: "float-slow 10s ease-in-out infinite"}} />
                <div className="absolute w-[150px] h-[150px] rounded-full bg-purple-400/10 top-1/3 right-10 blur-xl" style={{animation: "float 12s ease-in-out infinite reverse"}} />

                <div className="relative z-10 max-w-md text-white space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm">
                            <BrainCircuit className="h-7 w-7" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">NuvIQ</span>
                    </div>
                    <h2 className="text-3xl font-bold leading-tight">
                        Predictive Sales Insights, Simplified.
                    </h2>
                    <p className="text-white/80 text-lg leading-relaxed">
                        Upload your sales data and receive AI-powered forecasts, product bundle recommendations, and category performance insights.
                    </p>

                    {/* Feature mini-cards */}
                    <div className="grid grid-cols-3 gap-3 pt-4">
                        <div className="flex flex-col items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/10">
                            <BarChart3 className="h-6 w-6 text-white/90" />
                            <span className="text-xs text-white/70 text-center leading-tight">Sales Forecasts</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/10">
                            <ShoppingBasket className="h-6 w-6 text-white/90" />
                            <span className="text-xs text-white/70 text-center leading-tight">Product Bundles</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/10">
                            <TrendingUp className="h-6 w-6 text-white/90" />
                            <span className="text-xs text-white/70 text-center leading-tight">Growth Insights</span>
                        </div>
                    </div>

                    <div className="flex gap-6 pt-2">
                        <div className="flex items-center gap-2 text-sm text-white/70">
                            <div className="h-2 w-2 rounded-full bg-green-400" />
                            Real-time analytics
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                            <div className="h-2 w-2 rounded-full bg-green-400" />
                            AI-powered
                        </div>
                    </div>
                </div>
            </div>

            {/* Right panel - form */}
            <div className="flex flex-1 flex-col bg-background relative">
                {/* Richer background on right side */}
                <div className="absolute inset-0 bg-mesh-gradient opacity-70" />
                <div className="absolute inset-0 bg-grid-pattern-subtle opacity-60" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/[0.06] via-purple-500/[0.03] to-transparent rounded-full -translate-y-1/3 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-accent/[0.04] to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />

                <header className="relative flex items-center px-6 h-16 lg:hidden">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
                            <BrainCircuit className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold font-headline tracking-tight">
                            NuvIQ
                        </span>
                    </Link>
                </header>
                <div className="relative flex flex-1 items-center justify-center p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

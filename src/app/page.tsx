import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    BarChart3,
    BrainCircuit,
    ShoppingBasket,
    UploadCloud,
    Sparkles,
    TrendingUp,
    Zap,
    CheckCircle2,
    Shield,
    Clock,
    LineChart,
    Package,
    FileUp,
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const heroImage = PlaceHolderImages.find((img) => img.id === "hero");

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-background overflow-hidden relative">
            {/* Global page mesh gradient */}
            <div className="fixed inset-0 bg-mesh-gradient pointer-events-none -z-20" />
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
                <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-4 lg:px-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2"
                        prefetch={false}
                    >
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
                            <BrainCircuit className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold font-headline tracking-tight">
                            NuvIQ
                        </span>
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link
                            href="/login"
                            className="nav-link hidden sm:block"
                            prefetch={false}
                        >
                            Sign in
                        </Link>
                        <Button asChild size="sm" className="rounded-full px-5">
                            <Link href="/signup">
                                Get Started
                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* ═══════════ HERO ═══════════ */}
                <section className="relative overflow-hidden">
                    {/* Background layers */}
                    <div className="absolute inset-0 -z-10 bg-grid-pattern-subtle" />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/50 to-background" />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.03]" />

                    {/* Floating orbs - stronger */}
                    <div className="orb orb-primary w-[600px] h-[600px] -top-40 -left-40 -z-10 opacity-80" />
                    <div className="orb orb-accent w-[500px] h-[500px] top-20 -right-32 -z-10 opacity-70" />
                    <div className="orb orb-purple w-[400px] h-[400px] bottom-0 left-1/3 -z-10 opacity-60" />
                    <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] bg-gradient-to-br from-purple-400/[0.06] to-transparent rounded-full blur-2xl -z-10" />

                    {/* Geometric shapes */}
                    <div className="geo-shape geo-ring w-[140px] h-[140px] top-[12%] left-[5%] -z-[5] opacity-60" />
                    <div className="geo-shape geo-ring-accent w-[100px] h-[100px] bottom-[15%] right-[6%] -z-[5] opacity-50" />
                    <div className="geo-shape geo-diamond w-[45px] h-[45px] top-[55%] left-[8%] -z-[5] opacity-70" />
                    <div className="geo-shape geo-square w-[35px] h-[35px] top-[18%] right-[12%] -z-[5] opacity-50" />
                    <div className="geo-shape geo-circle-filled w-[20px] h-[20px] top-[40%] left-[15%] -z-[5]" />
                    <div className="geo-shape geo-circle-filled w-[14px] h-[14px] bottom-[25%] right-[20%] -z-[5]" />
                    <div className="geo-shape geo-triangle top-[25%] right-[8%] -z-[5] opacity-40" />

                    <div className="mx-auto max-w-6xl px-4 lg:px-6 pt-20 pb-16 md:pt-32 md:pb-24">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                            <div className="flex flex-col space-y-8">
                                <div className="section-badge w-fit">
                                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                                    AI-Powered Sales Analytics
                                </div>
                                <div className="space-y-4">
                                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl font-headline leading-[1.1]">
                                        Predictive Sales Insights,{" "}
                                        <span className="gradient-text">
                                            Simplified
                                        </span>
                                    </h1>
                                    <p className="max-w-[540px] text-lg text-muted-foreground leading-relaxed">
                                        Turn your sales data into actionable
                                        forecasts and product bundle
                                        recommendations. NuvIQ empowers your
                                        business with AI-driven analytics.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/25">
                                        <Link href="/signup">
                                            Start Free
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                                        <Link href="/login">
                                            View Demo
                                        </Link>
                                    </Button>
                                </div>
                                {/* Trust badges */}
                                <div className="flex flex-wrap items-center gap-5 pt-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Zap className="h-4 w-4 text-primary" />
                                        <span>Instant setup</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <TrendingUp className="h-4 w-4 text-accent" />
                                        <span>AI-powered forecasts</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Shield className="h-4 w-4 text-chart-3" />
                                        <span>Secure data</span>
                                    </div>
                                </div>
                            </div>

                            {/* Hero image with decorative frame */}
                            {heroImage && (
                                <div className="relative">
                                    {/* Glow behind image */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 to-accent/15 rounded-2xl blur-3xl -z-10 scale-110" />
                                    {/* Decorative border ring */}
                                    <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 via-transparent to-accent/30 rounded-[18px] -z-[1]" />
                                    <Image
                                        src={heroImage.imageUrl}
                                        alt={heroImage.description}
                                        data-ai-hint={heroImage.imageHint}
                                        width={600}
                                        height={400}
                                        className="w-full rounded-2xl border shadow-2xl shadow-primary/10 object-cover"
                                    />
                                    {/* Floating stat cards on top of image */}
                                    <div className="absolute -bottom-6 -left-6 bg-card border rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
                                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-500/15">
                                            <TrendingUp className="h-5 w-5 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Revenue Growth</p>
                                            <p className="text-lg font-bold text-green-400">+24.5%</p>
                                        </div>
                                    </div>
                                    <div className="absolute -top-4 -right-4 bg-card border rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
                                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                                            <BarChart3 className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Forecast Accuracy</p>
                                            <p className="text-lg font-bold text-primary">94.2%</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Wave divider */}
                <div className="relative h-16 -mb-px overflow-hidden">
                    <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                        <path d="M0 60V30C240 5 480 50 720 30C960 10 1200 45 1440 30V60H0Z" fill="hsl(var(--muted) / 0.6)" />
                        <path d="M0 60V40C360 15 720 55 1080 35C1260 25 1380 40 1440 40V60H0Z" fill="hsl(var(--muted) / 0.3)" />
                    </svg>
                </div>

                {/* ═══════════ STATS BAR ═══════════ */}
                <section className="relative border-y bg-muted/60">
                    <div className="absolute inset-0 bg-dot-pattern opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] via-transparent to-accent/[0.03]" />
                    <div className="absolute inset-0 bg-crosshatch opacity-40" />
                    <div className="relative mx-auto max-w-6xl px-4 lg:px-6 py-12">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="stat-card">
                                <p className="text-3xl font-bold gradient-text">500+</p>
                                <p className="text-sm text-muted-foreground mt-1">Datasets Analyzed</p>
                            </div>
                            <div className="stat-card">
                                <p className="text-3xl font-bold gradient-text">94%</p>
                                <p className="text-sm text-muted-foreground mt-1">Forecast Accuracy</p>
                            </div>
                            <div className="stat-card">
                                <p className="text-3xl font-bold gradient-text">2.5x</p>
                                <p className="text-sm text-muted-foreground mt-1">Revenue Uplift</p>
                            </div>
                            <div className="stat-card">
                                <p className="text-3xl font-bold gradient-text">&lt;30s</p>
                                <p className="text-sm text-muted-foreground mt-1">Analysis Time</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Gradient stripe divider */}
                <div className="gradient-stripe" />

                {/* ═══════════ FEATURES ═══════════ */}
                <section className="relative py-24 lg:py-32">
                    {/* Richer background */}
                    <div className="absolute inset-0 -z-10 bg-grid-pattern-subtle" />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/30 via-transparent to-muted/30" />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary/[0.03] via-transparent to-accent/[0.02]" />
                    <div className="absolute inset-0 -z-10 bg-diagonal-lines opacity-50" />
                    <div className="orb orb-accent w-[450px] h-[450px] top-20 -left-44 -z-10 opacity-70" />
                    <div className="orb orb-primary w-[350px] h-[350px] bottom-20 -right-20 -z-10 opacity-60" />
                    <div className="orb orb-purple w-[200px] h-[200px] top-1/2 left-1/2 -z-10 opacity-40" />

                    {/* Geometric shapes */}
                    <div className="geo-shape geo-ring w-[160px] h-[160px] top-[10%] right-[5%] -z-[5] opacity-50" />
                    <div className="geo-shape geo-diamond w-[55px] h-[55px] bottom-[15%] left-[6%] -z-[5] opacity-60" />
                    <div className="geo-shape geo-hexagon w-[50px] h-[50px] top-[40%] left-[3%] -z-[5] opacity-40" />
                    <div className="geo-shape geo-circle-filled w-[18px] h-[18px] bottom-[30%] right-[10%] -z-[5]" />
                    <div className="geo-shape geo-square w-[30px] h-[30px] top-[20%] left-[12%] -z-[5] opacity-40" />

                    <div className="mx-auto max-w-6xl px-4 lg:px-6">
                        <div className="flex flex-col items-center text-center space-y-4 mb-16">
                            <div className="section-badge">
                                Key Features
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-headline">
                                Unlock the Power of Your Data
                            </h2>
                            <p className="max-w-[640px] text-muted-foreground text-lg leading-relaxed">
                                NuvIQ provides the tools you need to
                                understand trends, predict future sales, and
                                discover hidden opportunities.
                            </p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="feature-card">
                                {/* Card internal bg */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent" />
                                <div className="geo-shape geo-ring w-[80px] h-[80px] -top-4 -right-4 opacity-20" />
                                <div className="geo-shape geo-circle-filled w-[10px] h-[10px] bottom-6 left-6 opacity-40" />
                                <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 text-primary mb-2">
                                    <BarChart3 className="h-7 w-7" />
                                </div>
                                <h3 className="relative text-lg font-semibold">
                                    Time-Series Forecasting
                                </h3>
                                <p className="relative text-sm text-muted-foreground leading-relaxed">
                                    Generate accurate 7, 30, and 90-day sales
                                    forecasts using proven statistical models to
                                    optimize inventory and strategy.
                                </p>
                            </div>
                            <div className="feature-card">
                                <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] to-transparent" />
                                <div className="geo-shape geo-ring-accent w-[80px] h-[80px] -top-4 -right-4 opacity-20" />
                                <div className="geo-shape geo-diamond w-[20px] h-[20px] bottom-6 left-6 opacity-30" />
                                <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-accent/10 text-accent mb-2">
                                    <ShoppingBasket className="h-7 w-7" />
                                </div>
                                <h3 className="relative text-lg font-semibold">
                                    Market Basket Analysis
                                </h3>
                                <p className="relative text-sm text-muted-foreground leading-relaxed">
                                    Discover which products are frequently
                                    bought together and create effective product
                                    bundles and cross-selling campaigns.
                                </p>
                            </div>
                            <div className="feature-card">
                                <div className="absolute inset-0 bg-gradient-to-br from-chart-3/[0.04] to-transparent" />
                                <div className="geo-shape geo-ring w-[80px] h-[80px] -top-4 -right-4 opacity-20" style={{borderColor: "hsl(var(--chart-3) / 0.15)"}} />
                                <div className="geo-shape geo-square w-[18px] h-[18px] bottom-6 left-6 opacity-25" />
                                <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-chart-3/10 text-chart-3 mb-2">
                                    <UploadCloud className="h-7 w-7" />
                                </div>
                                <h3 className="relative text-lg font-semibold">
                                    Seamless Data Upload
                                </h3>
                                <p className="relative text-sm text-muted-foreground leading-relaxed">
                                    Easily upload your sales data in CSV or
                                    Excel format. Our smart validation ensures
                                    your data is ready for analysis.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════ HOW IT WORKS ═══════════ */}
                <section className="relative py-24 lg:py-32 bg-muted/60 border-y">
                    <div className="absolute inset-0 bg-dot-pattern opacity-25" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03]" />
                    <div className="absolute inset-0 bg-crosshatch opacity-30" />

                    {/* Geometric shapes */}
                    <div className="geo-shape geo-ring-accent w-[120px] h-[120px] top-[8%] left-[4%] opacity-50" />
                    <div className="geo-shape geo-ring w-[90px] h-[90px] bottom-[10%] right-[5%] opacity-40" />
                    <div className="geo-shape geo-circle-filled w-[22px] h-[22px] top-[25%] right-[8%]" />
                    <div className="geo-shape geo-diamond w-[40px] h-[40px] bottom-[20%] left-[8%] opacity-50" />
                    <div className="relative mx-auto max-w-6xl px-4 lg:px-6">
                        <div className="flex flex-col items-center text-center space-y-4 mb-16">
                            <div className="section-badge">
                                How It Works
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-headline">
                                Three Simple Steps
                            </h2>
                            <p className="max-w-[640px] text-muted-foreground text-lg leading-relaxed">
                                From raw data to actionable insights in minutes.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 relative">
                            {/* Connecting line */}
                            <div className="hidden md:block absolute top-16 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-[2px] shimmer-line" />

                            <div className="relative flex flex-col items-center text-center">
                                <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg shadow-primary/25 mb-6">
                                    <FileUp className="h-7 w-7" />
                                    <div className="absolute -top-2 -right-2 flex items-center justify-center h-7 w-7 rounded-full bg-card border-2 border-primary text-primary text-xs font-bold">1</div>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Upload Your Data</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                                    Drag and drop your CSV file. Our smart column mapper auto-detects your data structure.
                                </p>
                            </div>

                            <div className="relative flex flex-col items-center text-center">
                                <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-accent to-teal-600 text-white shadow-lg shadow-accent/25 mb-6">
                                    <LineChart className="h-7 w-7" />
                                    <div className="absolute -top-2 -right-2 flex items-center justify-center h-7 w-7 rounded-full bg-card border-2 border-accent text-accent text-xs font-bold">2</div>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">AI Analyzes Patterns</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                                    Our engine generates forecasts, finds product bundles, and calculates category performance.
                                </p>
                            </div>

                            <div className="relative flex flex-col items-center text-center">
                                <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-chart-3 to-blue-600 text-white shadow-lg shadow-chart-3/25 mb-6">
                                    <Package className="h-7 w-7" />
                                    <div className="absolute -top-2 -right-2 flex items-center justify-center h-7 w-7 rounded-full bg-card border-2 border-chart-3 text-chart-3 text-xs font-bold">3</div>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Act on Insights</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                                    Make data-driven decisions with KPI dashboards, forecast charts, and bundle recommendations.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Gradient stripe divider */}
                <div className="gradient-stripe" />

                {/* ═══════════ CTA BANNER ═══════════ */}
                <section className="relative py-24 lg:py-32 overflow-hidden">
                    <div className="absolute inset-0 -z-10 bg-grid-pattern-subtle" />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-muted/40 to-transparent" />
                    <div className="absolute inset-0 -z-10 bg-diagonal-lines opacity-40" />
                    <div className="orb orb-primary w-[500px] h-[500px] -top-20 left-1/4 -z-10 opacity-80" />
                    <div className="orb orb-accent w-[400px] h-[400px] -bottom-20 right-1/4 -z-10 opacity-70" />
                    <div className="orb orb-purple w-[250px] h-[250px] top-1/2 right-1/3 -z-10 opacity-50" />

                    {/* Geometric shapes */}
                    <div className="geo-shape geo-ring w-[130px] h-[130px] top-[10%] left-[8%] -z-[5] opacity-50" />
                    <div className="geo-shape geo-ring-accent w-[100px] h-[100px] bottom-[12%] right-[6%] -z-[5] opacity-40" />
                    <div className="geo-shape geo-hexagon w-[45px] h-[45px] top-[30%] right-[10%] -z-[5] opacity-40" />
                    <div className="geo-shape geo-diamond w-[35px] h-[35px] bottom-[25%] left-[12%] -z-[5] opacity-50" />

                    <div className="mx-auto max-w-4xl px-4 lg:px-6">
                        <div className="relative rounded-3xl border bg-card overflow-hidden">
                            {/* Gradient top border */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-accent" />
                            {/* Background decoration inside card */}
                            <div className="absolute inset-0 bg-grid-pattern-subtle opacity-30" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/[0.06] to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/[0.05] to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
                            {/* Geometric shapes inside CTA card */}
                            <div className="geo-shape geo-ring w-[100px] h-[100px] top-6 left-8 opacity-25" />
                            <div className="geo-shape geo-ring-accent w-[70px] h-[70px] bottom-8 right-12 opacity-20" />
                            <div className="geo-shape geo-diamond w-[30px] h-[30px] top-8 right-1/3 opacity-30" />
                            <div className="geo-shape geo-hexagon w-[40px] h-[40px] bottom-6 left-1/4 opacity-20" />

                            <div className="relative flex flex-col items-center text-center p-12 md:p-16 space-y-6">
                                <div className="section-badge">
                                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                                    Get Started Today
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">
                                    Ready to Transform Your{" "}
                                    <span className="gradient-text">Sales Strategy</span>?
                                </h2>
                                <p className="text-muted-foreground text-lg max-w-lg leading-relaxed">
                                    Join businesses already using NuvIQ to forecast demand, discover product bundles, and drive revenue growth.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <Button asChild size="lg" className="rounded-full px-10 shadow-lg shadow-primary/25">
                                        <Link href="/signup">
                                            Create Free Account
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                                <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        No credit card required
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        CSV upload in seconds
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        Instant AI analysis
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="relative border-t bg-muted/50">
                <div className="absolute inset-0 bg-dot-pattern opacity-15" />
                <div className="relative mx-auto max-w-6xl flex flex-col gap-4 sm:flex-row py-8 items-center px-4 lg:px-6">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary text-primary-foreground">
                            <BrainCircuit className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-semibold">NuvIQ</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} NuvIQ. All rights reserved.
                    </p>
                    <nav className="sm:ml-auto flex gap-6">
                        <Link
                            href="#"
                            className="nav-link text-xs"
                            prefetch={false}
                        >
                            Terms of Service
                        </Link>
                        <Link
                            href="#"
                            className="nav-link text-xs"
                            prefetch={false}
                        >
                            Privacy
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}

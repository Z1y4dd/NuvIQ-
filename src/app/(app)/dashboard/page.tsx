"use client";
import OverviewTab from "@/components/dashboard/overview";
import ForecastChart from "@/components/dashboard/forecast-chart";
import BundlesTable from "@/components/dashboard/bundles-table";
import CategoriesTable from "@/components/dashboard/categories-table";
import UploadsTable from "@/components/dashboard/uploads-table";
import { BarChart3, Sparkles } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Dashboard header with gradient banner */}
            <div className="relative rounded-2xl border bg-card overflow-hidden shadow-sm">
                {/* Multi-layer gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.07] via-purple-500/[0.05] to-accent/[0.07]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
                <div className="absolute inset-0 bg-grid-pattern-subtle opacity-40" />
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-primary/15 via-purple-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-accent/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-primary/[0.04] rounded-full blur-2xl" />
                {/* Geometric shapes inside banner */}
                <div className="geo-shape geo-ring w-[90px] h-[90px] top-2 left-[45%] opacity-30" />
                <div className="geo-shape geo-diamond w-[28px] h-[28px] bottom-3 left-[30%] opacity-40" />
                <div className="geo-shape geo-circle-filled w-[14px] h-[14px] top-4 right-[35%] opacity-50" />
                <div className="geo-shape geo-square w-[20px] h-[20px] bottom-4 right-[20%] opacity-30" />

                <div className="relative p-6 md:p-8 flex items-center justify-between">
                    <div>
                        <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3 border border-primary/20">
                            <Sparkles className="mr-1.5 h-3 w-3" />
                            Analytics Dashboard
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight font-headline">Welcome to your Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Monitor your sales analytics, forecasts, and product insights</p>
                    </div>
                    {/* Decorative chart icon */}
                    <div className="hidden md:flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-purple-500/10 text-primary border border-primary/10">
                        <BarChart3 className="h-8 w-8" />
                    </div>
                </div>
            </div>

            {/* Overview KPIs - Always visible at top */}
            <OverviewTab />

            {/* Uploads Section */}
            <UploadsTable />

            {/* Forecast & Categories side by side on large screens */}
            <div className="grid gap-6 lg:grid-cols-2">
                <ForecastChart />
                <CategoriesTable />
            </div>

            {/* Bundles Section */}
            <BundlesTable />
        </div>
    );
}

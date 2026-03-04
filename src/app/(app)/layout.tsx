"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import AppHeader from "@/components/layout/header";
import { DatasetProvider } from "@/contexts/dataset-context";
import { Loader2 } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                    Loading your workspace...
                </p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <DatasetProvider>
            <div className="flex min-h-screen dashboard-bg">
                {/* Background visuals */}
                <div className="fixed inset-0 pointer-events-none -z-10">
                    <div className="absolute inset-0 bg-mesh-gradient opacity-60" />
                    <div className="absolute inset-0 bg-diagonal-lines opacity-30" />
                    <div className="absolute inset-0 bg-dot-pattern opacity-[0.05]" />
                    {/* Large gradient orbs */}
                    <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-primary/[0.15] via-purple-500/[0.08] to-transparent rounded-full -translate-y-1/4 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-accent/[0.10] via-teal-400/[0.05] to-transparent rounded-full translate-y-1/4 -translate-x-1/4" />
                    <div className="absolute top-1/3 left-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/[0.06] to-accent/[0.06] rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-to-tl from-purple-500/[0.08] to-transparent rounded-full blur-2xl" />

                    {/* Geometric shapes - more visible */}
                    <div className="geo-shape geo-ring w-[200px] h-[200px] top-[12%] right-[6%]" />
                    <div className="geo-shape geo-ring-accent w-[150px] h-[150px] bottom-[18%] right-[12%]" />
                    <div className="geo-shape geo-ring w-[100px] h-[100px] top-[55%] left-[5%]" />
                    <div className="geo-shape geo-diamond w-[60px] h-[60px] top-[30%] left-[10%]" />
                    <div className="geo-shape geo-diamond w-[35px] h-[35px] bottom-[40%] right-[20%]" />
                    <div className="geo-shape geo-square w-[45px] h-[45px] bottom-[25%] left-[6%]" />
                    <div className="geo-shape geo-square w-[30px] h-[30px] top-[20%] right-[25%]" />
                    <div className="geo-shape geo-circle-filled w-[30px] h-[30px] top-[55%] right-[22%]" />
                    <div className="geo-shape geo-circle-filled w-[20px] h-[20px] top-[18%] left-[28%]" />
                    <div className="geo-shape geo-circle-filled w-[16px] h-[16px] bottom-[35%] left-[45%]" />
                    <div className="geo-shape geo-hexagon w-[70px] h-[70px] bottom-[12%] left-[48%]" />
                    <div className="geo-shape geo-hexagon w-[45px] h-[45px] top-[40%] right-[10%]" />
                    <div className="geo-shape geo-triangle top-[65%] left-[15%]" />
                    <div className="geo-shape geo-triangle bottom-[10%] right-[30%]" />
                </div>

                <div className="flex-1 flex flex-col">
                    <AppHeader />
                    <main className="flex-1 p-4 sm:p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto">{children}</div>
                    </main>
                </div>
            </div>
        </DatasetProvider>
    );
}

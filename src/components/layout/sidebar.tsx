"use client";
import {
    Sidebar,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarHeader,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { BrainCircuit, LayoutDashboard, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AppSidebar = () => {
    const pathname = usePathname();

    return (
        <Sidebar
            variant="sidebar"
            collapsible="icon"
            className="hidden md:flex border-r relative overflow-hidden"
        >
            {/* Sidebar background decoration */}
            <div className="absolute inset-0 pointer-events-none -z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-accent/[0.03]" />
                <div className="absolute inset-0 bg-dot-pattern opacity-[0.12]" />
                <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-accent/[0.04] to-transparent" />
                {/* Decorative ring bottom */}
                <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full border border-primary/[0.06]" />
                <div className="absolute top-24 -left-10 w-24 h-24 rounded-full border border-accent/[0.07]" />
            </div>
            <SidebarHeader className="justify-between px-4 py-5 relative z-10">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground shrink-0">
                        <BrainCircuit className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold font-headline tracking-tight group-data-[collapsible=icon]:hidden">
                        NuvIQ
                    </span>
                </Link>
                <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
            </SidebarHeader>
            <SidebarMenu className="px-2 relative z-10">
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith("/dashboard")}
                        tooltip={{ children: "Dashboard" }}
                        className="rounded-lg h-10"
                    >
                        <Link href="/dashboard">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="group-data-[collapsible=icon]:hidden font-medium">
                                Dashboard
                            </span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === "/contact"}
                        tooltip={{ children: "Contact" }}
                        className="rounded-lg h-10"
                    >
                        <Link href="/contact">
                            <MessageSquare className="h-4 w-4" />
                            <span className="group-data-[collapsible=icon]:hidden font-medium">
                                Contact
                            </span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </Sidebar>
    );
};

export default AppSidebar;

"use client";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, BrainCircuit, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AppHeader() {
    const router = useRouter();
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U";

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 sm:px-6 relative overflow-hidden">
            {/* Header background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] via-transparent to-accent/[0.02] pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            {/* Brand */}
            <Link
                href="/dashboard"
                className="relative flex items-center gap-2.5 shrink-0"
            >
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
                    <BrainCircuit className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg tracking-tight font-headline">
                    NuvIQ
                </span>
            </Link>

            <div className="w-full flex-1" />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2 rounded-full pl-1 pr-3 h-9"
                    >
                        <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                                {userInitials}
                            </AvatarFallback>
                        </Avatar>
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                        <p className="text-sm font-medium">{user?.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-destructive focus:text-destructive"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}

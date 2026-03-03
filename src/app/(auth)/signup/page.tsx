"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrainCircuit, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signUp(email, password, name);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[400px] space-y-6">
            <div className="space-y-2 text-center lg:text-left">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary text-primary-foreground lg:hidden">
                    <BrainCircuit className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight font-headline">
                    Create your account
                </h1>
                <p className="text-muted-foreground">
                    Get started with NuvIQ in seconds
                </p>
            </div>
            <Card className="border-0 shadow-none lg:border lg:shadow-sm">
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4 p-0 lg:p-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Full name
                            </Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <Button
                            className="w-full h-11 mt-2 rounded-lg"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </CardContent>
                </form>
            </Card>
            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}

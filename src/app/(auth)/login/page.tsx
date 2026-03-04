"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    BrainCircuit,
    ArrowRight,
    Loader2,
    ArrowLeft,
    Mail,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Forgot password state
    const [showReset, setShowReset] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetSent, setResetSent] = useState(false);
    const [resetError, setResetError] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

    const { signIn, signInWithGoogle, resetPassword } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signIn(email, password);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetError("");
        setResetLoading(true);
        try {
            await resetPassword(resetEmail);
            setResetSent(true);
        } catch (err: any) {
            setResetError(err.message || "Failed to send reset email");
        } finally {
            setResetLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);
        try {
            await signInWithGoogle();
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to sign in with Google");
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
                {showReset ? (
                    <>
                        <h1 className="text-2xl font-bold tracking-tight font-headline">
                            Reset your password
                        </h1>
                        <p className="text-muted-foreground">
                            Enter your email and we&apos;ll send you a reset
                            link
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold tracking-tight font-headline">
                            Welcome back
                        </h1>
                        <p className="text-muted-foreground">
                            Enter your credentials to access your dashboard
                        </p>
                    </>
                )}
            </div>

            {showReset ? (
                <Card className="border-0 shadow-none lg:border lg:shadow-sm">
                    {resetSent ? (
                        <CardContent className="grid gap-4 p-0 lg:p-6">
                            <div className="flex flex-col items-center gap-3 py-4 text-center">
                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <p className="font-medium">Check your email</p>
                                <p className="text-sm text-muted-foreground">
                                    A password reset link has been sent to{" "}
                                    <span className="font-medium text-foreground">
                                        {resetEmail}
                                    </span>
                                    .
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full h-11 rounded-lg"
                                onClick={() => {
                                    setShowReset(false);
                                    setResetSent(false);
                                    setResetEmail("");
                                }}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to sign in
                            </Button>
                        </CardContent>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <CardContent className="grid gap-4 p-0 lg:p-6">
                                {resetError && (
                                    <Alert variant="destructive">
                                        <AlertDescription>
                                            {resetError}
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="reset-email"
                                        className="text-sm font-medium"
                                    >
                                        Email address
                                    </Label>
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        placeholder="you@company.com"
                                        value={resetEmail}
                                        onChange={(e) =>
                                            setResetEmail(e.target.value)
                                        }
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <Button
                                    className="w-full h-11 mt-2 rounded-lg"
                                    type="submit"
                                    disabled={resetLoading}
                                >
                                    {resetLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send reset link
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full h-9 rounded-lg text-muted-foreground"
                                    onClick={() => {
                                        setShowReset(false);
                                        setResetError("");
                                    }}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to sign in
                                </Button>
                            </CardContent>
                        </form>
                    )}
                </Card>
            ) : (
                <Card className="border-0 shadow-none lg:border lg:shadow-sm">
                    <form onSubmit={handleSubmit}>
                        <CardContent className="grid gap-4 p-0 lg:p-6">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium"
                                >
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
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium"
                                    >
                                        Password
                                    </Label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowReset(true);
                                            setResetEmail(email);
                                            setResetError("");
                                            setResetSent(false);
                                        }}
                                        className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
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
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </form>
                </Card>
            )}

            {!showReset && (
                <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                        Create one
                    </Link>
                </p>
            )}
        </div>
    );
}

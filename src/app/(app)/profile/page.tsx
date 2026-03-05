"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getUserProfile, updateUserProfile } from "@/lib/firestore";
import {
    updateProfile,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, KeyRound, Shield, Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [displayName, setDisplayName] = useState("");
    const [firestoreName, setFirestoreName] = useState("");
    const [createdAt, setCreatedAt] = useState("");
    const [saving, setSaving] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    const isEmailUser = user?.providerData?.some(
        (p) => p.providerId === "password",
    );

    useEffect(() => {
        if (!user) return;
        setDisplayName(user.displayName || "");

        const loadProfile = async () => {
            try {
                const profile = await getUserProfile(user.uid);
                if (profile) {
                    setFirestoreName(profile.name || "");
                    setCreatedAt(profile.createdAt || "");
                    if (!user.displayName && profile.name) {
                        setDisplayName(profile.name);
                    }
                }
            } catch (err) {
                console.error("Failed to load profile:", err);
            } finally {
                setLoadingProfile(false);
            }
        };
        loadProfile();
    }, [user]);

    const handleSaveName = async () => {
        if (!user || !displayName.trim()) return;
        setSaving(true);
        try {
            await updateProfile(user, { displayName: displayName.trim() });
            await updateUserProfile(user.uid, { name: displayName.trim() });
            toast({
                title: "Profile Updated",
                description: "Your display name has been saved.",
            });
        } catch (err: any) {
            console.error("Failed to update profile:", err);
            toast({
                title: "Update Failed",
                description: err.message || "Could not update your profile.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!user || !isEmailUser) return;
        if (newPassword !== confirmPassword) {
            toast({
                title: "Passwords Don't Match",
                description: "New password and confirmation must match.",
                variant: "destructive",
            });
            return;
        }
        if (newPassword.length < 6) {
            toast({
                title: "Password Too Short",
                description: "Password must be at least 6 characters.",
                variant: "destructive",
            });
            return;
        }
        setChangingPassword(true);
        try {
            const credential = EmailAuthProvider.credential(
                user.email!,
                currentPassword,
            );
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toast({
                title: "Password Changed",
                description: "Your password has been updated successfully.",
            });
        } catch (err: any) {
            console.error("Password change failed:", err);
            toast({
                title: "Password Change Failed",
                description:
                    err.code === "auth/wrong-password"
                        ? "Current password is incorrect."
                        : err.message || "Could not change password.",
                variant: "destructive",
            });
        } finally {
            setChangingPassword(false);
        }
    };

    if (loadingProfile) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="rounded-lg"
                >
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Profile
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your account settings
                    </p>
                </div>
            </div>

            {/* Account Information */}
            <Card className="relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.02] pointer-events-none" />
                <CardHeader className="relative">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                            <User className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-lg">
                            Account Information
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Your account details and display name
                    </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                    <div className="grid gap-1.5">
                        <Label className="text-muted-foreground text-sm">
                            Email
                        </Label>
                        <p className="text-sm font-medium">{user?.email}</p>
                    </div>
                    <div className="grid gap-1.5">
                        <Label className="text-muted-foreground text-sm">
                            Auth Provider
                        </Label>
                        <div className="flex items-center gap-2">
                            {user?.providerData?.map((p) => (
                                <Badge key={p.providerId} variant="secondary">
                                    {p.providerId === "password"
                                        ? "Email / Password"
                                        : p.providerId === "google.com"
                                          ? "Google"
                                          : p.providerId}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    {createdAt && (
                        <div className="grid gap-1.5">
                            <Label className="text-muted-foreground text-sm">
                                Member Since
                            </Label>
                            <p className="text-sm font-medium">
                                {new Date(createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    },
                                )}
                            </p>
                        </div>
                    )}
                    <Separator />
                    <div className="grid gap-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <div className="flex gap-2">
                            <Input
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your display name"
                                className="max-w-sm"
                            />
                            <Button
                                onClick={handleSaveName}
                                disabled={saving || !displayName.trim()}
                                size="sm"
                                className="rounded-lg"
                            >
                                {saving ? (
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Save className="mr-1.5 h-3.5 w-3.5" />
                                )}
                                Save
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Password Change — only for email/password users */}
            {isEmailUser && (
                <Card className="relative overflow-hidden shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.02] pointer-events-none" />
                    <CardHeader className="relative">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                                <KeyRound className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-lg">
                                Change Password
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Update your account password
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-4">
                        <div className="grid gap-2 max-w-sm">
                            <Label htmlFor="currentPassword">
                                Current Password
                            </Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                placeholder="Enter current password"
                            />
                        </div>
                        <div className="grid gap-2 max-w-sm">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className="grid gap-2 max-w-sm">
                            <Label htmlFor="confirmPassword">
                                Confirm New Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="Confirm new password"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="relative">
                        <Button
                            onClick={handleChangePassword}
                            disabled={
                                changingPassword ||
                                !currentPassword ||
                                !newPassword ||
                                !confirmPassword
                            }
                            className="rounded-lg"
                        >
                            {changingPassword ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Shield className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            Update Password
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { saveContactMessage } from "@/lib/firestore";
import { Mail, Send, MessageSquare, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
    const { toast } = useToast();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) {
            toast({
                title: "Missing Fields",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast({
                title: "Invalid Email",
                description: "Please enter a valid email address.",
                variant: "destructive",
            });
            return;
        }

        setSending(true);
        try {
            // 1. Save to Firestore
            await saveContactMessage({ name, email, subject, message });

            // 2. Open mailto so the message also lands in the inbox
            const mailtoUrl =
                `mailto:Ryan_56@outlook.sa` +
                `?subject=${encodeURIComponent(subject || "Contact Form Message")}` +
                `&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
            window.open(mailtoUrl, "_blank");

            toast({
                title: "Message Sent!",
                description:
                    "Thanks for reaching out. We'll get back to you within 24–48 hours.",
            });

            setName("");
            setEmail("");
            setSubject("");
            setMessage("");
        } catch (err) {
            console.error("Failed to save contact message:", err);
            toast({
                title: "Failed to Send",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-10">
            {/* Page header */}
            <div className="mb-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold font-headline tracking-tight">
                            Contact Us
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            We'd love to hear from you. Send us a message and
                            we'll respond promptly.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
                {/* Contact form */}
                <Card className="lg:col-span-2 border-border/60 bg-card/80 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Send className="h-4 w-4 text-primary" />
                            Send a Message
                        </CardTitle>
                        <CardDescription>
                            Fill out the form below and we'll get back to you as
                            soon as possible.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Name{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="Your full name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        disabled={sending}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        disabled={sending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    placeholder="What's this about?"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    disabled={sending}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">
                                    Message{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="message"
                                    placeholder="Tell us how we can help you..."
                                    rows={6}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={sending}
                                    className="resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full sm:w-auto"
                                disabled={sending}
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Message
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Contact info sidebar */}
                <div className="space-y-4">
                    <Card className="border-border/60 bg-card/80 backdrop-blur">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                                Contact Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary shrink-0">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                                        Email
                                    </p>
                                    <a
                                        href="mailto:Ryan_56@outlook.sa"
                                        className="text-sm font-medium text-foreground hover:text-primary transition-colors break-all"
                                    >
                                        Ryan_56@outlook.sa
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-primary/5 backdrop-blur">
                        <CardContent className="pt-5">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                <span className="font-semibold text-foreground">
                                    Response time:
                                </span>{" "}
                                We typically respond within{" "}
                                <span className="text-primary font-medium">
                                    24–48 hours
                                </span>{" "}
                                on business days.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

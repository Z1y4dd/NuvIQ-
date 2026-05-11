import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
    title: "NuvIQ — Predictive Sales Insights",
    description:
        "Upload sales data and receive accurate forecasts and product bundle recommendations.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="font-body antialiased" suppressHydrationWarning>
                <Providers>
                    {children}
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}

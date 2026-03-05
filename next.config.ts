import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: [
        "firebase-admin",
        "@google-cloud/firestore",
        "genkit",
        "@genkit-ai/google-genai",
        "@genkit-ai/core",
        "@genkit-ai/next",
        "@grpc/grpc-js",
        "@opentelemetry/sdk-node",
        "@opentelemetry/exporter-trace-otlp-grpc",
        "@opentelemetry/otlp-grpc-exporter-base",
        "@opentelemetry/sdk-trace-node",
        "@opentelemetry/sdk-trace-base",
        "@opentelemetry/core",
        "@opentelemetry/resources",
    ],
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "picsum.photos",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;

"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.8,
                delay,
                ease: [0.16, 1, 0.3, 1],
            }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    );
}

export function GlassContainer({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn(
            "relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl group",
            className
        )}>
            {/* Subtle Glows */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full group-hover:bg-blue-500/10 transition-all duration-700" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full group-hover:bg-purple-500/10 transition-all duration-700" />

            <div className="relative">
                {children}
            </div>
        </div>
    );
}

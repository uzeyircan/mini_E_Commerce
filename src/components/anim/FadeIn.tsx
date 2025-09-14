// src/components/anim/FadeIn.tsx
import { motion } from "framer-motion";
import React from "react";

type Props = {
  children: React.ReactNode;
  delay?: number; // saniye
  y?: number; // başlangıç ofseti
  once?: boolean; // sadece ilk görünümde mi
  className?: string;
  style?: React.CSSProperties;
};

export default function FadeIn({
  children,
  delay = 0,
  y = 16,
  once = true,
  className,
  style,
}: Props) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.25 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

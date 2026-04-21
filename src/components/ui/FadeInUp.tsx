import { motion } from "motion/react";
import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface FadeInUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  yOffset?: number;
}

export function FadeInUp({ children, delay = 0, className, yOffset = 40 }: FadeInUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1], // Apple-like custom spring simulation
      }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}

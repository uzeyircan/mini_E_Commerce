// src/components/anim/Aurora.tsx
import React from "react";

export default function Aurora() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          left: "10%",
          top: "-20%",
          filter: "blur(80px)",
          opacity: 0.35,
          background:
            "radial-gradient(35% 35% at 50% 50%, #7c8cff 0%, transparent 70%)",
          animation: "auroraFloat 12s ease-in-out infinite",
          transformOrigin: "50% 50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          right: "5%",
          bottom: "-15%",
          filter: "blur(90px)",
          opacity: 0.3,
          background:
            "radial-gradient(35% 35% at 50% 50%, #22d3ee 0%, transparent 70%)",
          animation: "auroraFloat2 14s ease-in-out infinite",
          transformOrigin: "50% 50%",
        }}
      />
      <style>{`
        @keyframes auroraFloat {
          0%, 100% { transform: translate3d(0,0,0) rotate(0deg) scale(1); }
          50% { transform: translate3d(20px, -10px, 0) rotate(6deg) scale(1.05); }
        }
        @keyframes auroraFloat2 {
          0%, 100% { transform: translate3d(0,0,0) rotate(0deg) scale(1); }
          50% { transform: translate3d(-25px, 15px, 0) rotate(-5deg) scale(1.06); }
        }
      `}</style>
    </div>
  );
}

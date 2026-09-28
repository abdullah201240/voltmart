"use client";

import { useState } from "react";
import Image from "next/image";
import { classNames } from "@/lib/format";

// Product visuals: an original studio photo when available (src), otherwise a
// soft studio-gradient tile with a device silhouette per category. The photo
// gracefully falls back to the tile if the file is missing.

type Glyph = "phone" | "laptop" | "tablet" | "monitor" | "tv" | "gamepad" | "camera" | "watch" | "charger" | "speaker" | "default";

const CATEGORY_GLYPH: Record<string, Glyph> = {
  mobiles: "phone",
  laptops: "laptop",
  tablets: "tablet",
  computers: "monitor",
  "tv-audio": "tv",
  gaming: "gamepad",
  cameras: "camera",
  "smart-devices": "watch",
  accessories: "charger",
  "home-appliances": "speaker",
};

function DeviceGlyph({ kind }: { kind: Glyph }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "phone":
      return (<g {...common}><rect x="34" y="14" width="32" height="72" rx="7" /><path d="M46 22h8" /><circle cx="50" cy="76" r="3" /></g>);
    case "laptop":
      return (<g {...common}><rect x="24" y="22" width="52" height="34" rx="3" /><path d="M16 68h68l-6-12H22z" /></g>);
    case "tablet":
      return (<g {...common}><rect x="26" y="14" width="48" height="72" rx="6" /><path d="M44 22h12" /></g>);
    case "monitor":
      return (<g {...common}><rect x="16" y="20" width="68" height="44" rx="4" /><path d="M40 76h20M50 64v12" /></g>);
    case "tv":
      return (<g {...common}><rect x="12" y="20" width="76" height="48" rx="3" /><path d="M34 78h32" /><circle cx="50" cy="44" r="10" /></g>);
    case "gamepad":
      return (<g {...common}><rect x="14" y="34" width="72" height="34" rx="16" /><path d="M30 44v12M24 50h12" /><circle cx="66" cy="46" r="2.5" /><circle cx="74" cy="54" r="2.5" /></g>);
    case "camera":
      return (<g {...common}><rect x="16" y="30" width="68" height="44" rx="6" /><circle cx="50" cy="52" r="13" /><path d="M36 30l4-8h20l4 8" /></g>);
    case "watch":
      return (<g {...common}><rect x="34" y="30" width="32" height="40" rx="10" /><path d="M42 30l1-16h14l1 16M42 70l1 16h14l1-16" /></g>);
    case "charger":
      return (<g {...common}><rect x="24" y="18" width="52" height="44" rx="8" /><path d="M38 62v20M62 62v20" /></g>);
    case "speaker":
      return (<g {...common}><rect x="28" y="14" width="44" height="72" rx="10" /><circle cx="50" cy="58" r="14" /><circle cx="50" cy="30" r="5" /></g>);
    default:
      return (<g {...common}><rect x="20" y="20" width="60" height="60" rx="10" /><circle cx="50" cy="50" r="14" /></g>);
  }
}

export function ProductImage({
  category,
  tone,
  name,
  className,
  glyphClassName = "text-neutral-700/40",
  rounded = "rounded-md",
  src,
  sizes = "(max-width: 640px) 50vw, 25vw",
}: {
  category: string;
  tone: string;
  name: string;
  className?: string;
  glyphClassName?: string;
  rounded?: string;
  src?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const kind = CATEGORY_GLYPH[category] ?? "default";
  return (
    <div
      role="img"
      aria-label={name}
      className={classNames("relative overflow-hidden bg-gradient-to-br", tone, rounded, className)}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={sizes}
          className="object-cover"
          onError={() => setFailed(true)}
          draggable={false}
        />
      ) : (
        <>
          {/* studio light */}
          <div className="absolute -top-1/3 left-1/2 h-2/3 w-2/3 -translate-x-1/2 rounded-full bg-white/50 blur-3xl" />
          <svg
            viewBox="0 0 100 100"
            className={classNames("absolute inset-0 h-full w-full p-[22%] drop-shadow-sm", glyphClassName)}
          >
            <DeviceGlyph kind={kind} />
          </svg>
        </>
      )}
    </div>
  );
}

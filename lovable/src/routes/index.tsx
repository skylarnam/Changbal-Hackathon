import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Derma AI — Cozy Skin Ritual" },
      { name: "description", content: "Eight-screen mobile concept for an Warm, cozy skincare lifestyle companion." },
      { property: "og:title", content: "Derma AI — Cozy Skin Ritual" },
      {
        property: "og:description",
        content: "Six-screen mobile concept for an Warm, cozy skincare lifestyle companion.",
      },
    ],
  }),
  component: Index,
});

const NAVY = "#2F4F4F";
const BLUE = "#6B8E6B";
const GRAY_BG = "#FAF7F2";
const TEXT_MUTED = "#8B7E6E";
const TEXT_SOFT = "#B8AC9D";
const CRIMSON = "#E89F71";

// function TopNav() {
//   return (
//     <div
//       className="absolute left-0 right-0 flex items-center justify-end px-5"
//       style={{
//         top: 26,
//         height: 56,
//         backgroundColor: "#FFFFFF",
//         boxShadow: "0 12px 30px -18px rgba(74,68,58,0.28), 0 4px 12px -8px rgba(74,68,58,0.12)",
//         zIndex: 40,
//       }}
//     >
//       <button
//         aria-label="Notifications"
//         className="relative flex h-9 w-9 items-center justify-center rounded-full"
//         style={{ backgroundColor: "rgba(143,158,143,0.10)" }}
//       >
//         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//           <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
//           <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
//         </svg>
//         <span
//           className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full"
//           style={{ backgroundColor: CRIMSON }}
//         />
//       </button>
//     </div>
//   );
// }

function Frame({ label, children, nav = true }: { label: string; children: React.ReactNode; nav?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 text-xs font-semibold tracking-widest" style={{ color: TEXT_MUTED }}>
        {label}
      </div>
      <div
        className="relative overflow-hidden"
        style={{
          width: 390,
          height: 844,
          backgroundColor: GRAY_BG,
          borderRadius: 44,
          boxShadow: "0 30px 80px -20px rgba(74,68,58,0.25), 0 0 0 8px #2F4F4F, 0 0 0 9px #2F4F4F",
        }}
      >
        {/* status bar */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 pt-3 text-[11px] font-semibold"
          style={{ color: NAVY, zIndex: 50 }}
        >
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span>●●●●</span>
            <span>5G</span>
            <span>■</span>
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}

// ---------- Page 1: Onboarding ----------
function Page1() {
  return (
    <Frame label="01 · ONBOARDING">
      <div className="absolute inset-0 pt-24 pb-28 px-6 flex flex-col">
        {/* progress bar */}
        <div className="mt-2 flex items-center justify-between text-[11px] font-semibold" style={{ color: TEXT_SOFT }}>
          <span>STEP 02 / 04</span>
          <span style={{ color: BLUE }}>50%</span>
        </div>
        <div className="mt-2 h-[3px] w-full rounded-full" style={{ backgroundColor: "#ECE6DA" }}>
          <div className="h-full rounded-full" style={{ width: "50%", backgroundColor: BLUE }} />
        </div>

        <h1 className="mt-7 text-[28px] font-extrabold leading-tight" style={{ color: NAVY, letterSpacing: "-0.02em" }}>
          Select Your
          <br />
          Skin Type.
        </h1>
        <p className="mt-2 text-[13px]" style={{ color: TEXT_MUTED }}>
          We calibrate analysis to your baseline biology.
        </p>

        {/* Skin type cards */}
        <div className="mt-6 space-y-3">
          {/* Dry — selected */}
          <div
            className="relative rounded-2xl px-5 py-4"
            style={{
              backgroundColor: "rgba(107,142,107,0.07)",
              boxShadow: "0 12px 30px -12px rgba(107,142,107,0.35), inset 0 0 0 1px rgba(107,142,107,0.18)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[17px] font-extrabold" style={{ color: NAVY }}>
                  Dry
                </div>
                <div className="mt-1 text-[12px]" style={{ color: TEXT_MUTED }}>
                  Feels tight after washing
                </div>
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: BLUE }}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </div>

          {/* Oily */}
          <div
            className="rounded-2xl bg-white px-5 py-4"
            style={{ boxShadow: "0 10px 24px -16px rgba(74,68,58,0.18)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[17px] font-extrabold" style={{ color: NAVY }}>
                  Oily
                </div>
                <div className="mt-1 text-[12px]" style={{ color: TEXT_MUTED }}>
                  Shine returns within hours
                </div>
              </div>
              <div className="h-5 w-5 rounded-full" style={{ backgroundColor: "#ECE6DA" }} />
            </div>
          </div>

          {/* Combination */}
          <div
            className="rounded-2xl bg-white px-5 py-4"
            style={{ boxShadow: "0 10px 24px -16px rgba(74,68,58,0.18)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[17px] font-extrabold" style={{ color: NAVY }}>
                  Combination
                </div>
                <div className="mt-1 text-[12px]" style={{ color: TEXT_MUTED }}>
                  Oily T-zone, dry cheeks
                </div>
              </div>
              <div className="h-5 w-5 rounded-full" style={{ backgroundColor: "#ECE6DA" }} />
            </div>
          </div>
        </div>

        {/* Concerns */}
        <div className="mt-7">
          <div className="text-[11px] font-bold tracking-[0.2em]" style={{ color: TEXT_SOFT }}>
            PICK YOUR CONCERNS
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { t: "#Hydration", active: true },
              { t: "#Acne", active: false },
              { t: "#Redness", active: true },
              { t: "#Pores", active: false },
            ].map((c) => (
              <span
                key={c.t}
                className="px-3.5 py-1.5 rounded-full text-[12px] font-bold"
                style={
                  c.active
                    ? { backgroundColor: NAVY, color: "white" }
                    : { backgroundColor: "white", color: NAVY, boxShadow: "0 4px 12px -6px rgba(74,68,58,0.15)" }
                }
              >
                {c.t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4"
        style={{ background: `linear-gradient(to top, ${GRAY_BG} 70%, rgba(250,247,242,0))` }}
      >
        <button
          className="w-full rounded-2xl py-4 text-[15px] font-bold text-white"
          style={{ backgroundColor: NAVY, boxShadow: "0 18px 40px -16px rgba(47,79,79,0.6)" }}
        >
          Analyze Skin in 3 Seconds →
        </button>
      </div>
    </Frame>
  );
}

// ---------- Page 2: Loading ----------
function Page2() {
  const steps = [
    { t: "Analyzing Raw Data...", state: "done" },
    { t: "Matching Skin Profile...", state: "done" },
    { t: "Screening Ingredients...", state: "active" },
    { t: "Scoring...", state: "pending" },
  ];
  return (
    <Frame label="02 · PROCESSING">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
        {/* spinner */}
        <div className="relative" style={{ width: 72, height: 72 }}>
          <svg
            viewBox="0 0 50 50"
            width="72"
            height="72"
            className="animate-spin"
            style={{ animationDuration: "1.2s" }}
          >
            <circle cx="25" cy="25" r="20" fill="none" stroke="#ECE6DA" strokeWidth="2" />
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke={BLUE}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="30 200"
            />
          </svg>
        </div>

        <div className="mt-10 text-[11px] font-bold tracking-[0.3em]" style={{ color: TEXT_SOFT }}>
          DERMA.AI · v2.4
        </div>
        <div className="mt-2 text-[18px] font-extrabold" style={{ color: NAVY, letterSpacing: "-0.01em" }}>
          Running diagnostics
        </div>

        <div className="mt-8 w-full max-w-[260px] space-y-3 font-mono">
          {steps.map((s, i) => {
            const color = s.state === "done" ? NAVY : s.state === "active" ? BLUE : TEXT_SOFT;
            return (
              <div key={i} className="flex items-center justify-between text-[12px]" style={{ color }}>
                <span className="font-semibold">
                  {i + 1}. {s.t}
                </span>
                <span className="text-[10px] font-bold tracking-wider">
                  {s.state === "done" ? "✓ OK" : s.state === "active" ? "···" : ""}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-[10px] tracking-[0.25em]" style={{ color: TEXT_SOFT }}>
          PROCESSING NODE · US-EAST-04
        </div>
      </div>
    </Frame>
  );
}

// ---------- Page 3: Report ----------
function ScanOptionsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end transition-opacity duration-300"
      style={{
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
      }}
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(42,48,42,0.35)" }} />

      {/* sheet */}
      <div
        className="relative flex flex-col px-6 pt-5 pb-8 transition-transform duration-300 ease-out"
        style={{
          backgroundColor: "#FAF7F2",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          transform: open ? "translateY(0)" : "translateY(100%)",
          boxShadow: "0 -20px 60px -20px rgba(74,68,58,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* drag handle */}
        <div className="mx-auto mb-6 h-1.5 w-12 rounded-full" style={{ backgroundColor: "#D6CFC4" }} />

        {/* header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[18px] font-extrabold" style={{ color: "#2A4B44", letterSpacing: "-0.02em" }}>
            What would you like to scan?
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
            style={{ backgroundColor: "rgba(107,142,107,0.08)" }}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A4B44" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Option A — Product Front */}
        <button
          className="mb-3 flex items-center gap-4 rounded-2xl border bg-white p-5 text-left transition-all duration-200"
          style={{ borderColor: "#E6E2DA" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F0F4EE";
            e.currentTarget.style.borderColor = "#6B8E6B";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FFFFFF";
            e.currentTarget.style.borderColor = "#E6E2DA";
          }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(107,142,107,0.08)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B8E6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <div>
            <div className="text-[15px] font-extrabold" style={{ color: "#2A4B44" }}>
              Product Front
            </div>
            <div className="mt-0.5 text-[12px] leading-relaxed" style={{ color: "#9C8E7D" }}>
              Scan the brand name or product label to search our database.
            </div>
          </div>
        </button>

        {/* Option B — Ingredient List */}
        <button
          className="flex items-center gap-4 rounded-2xl border bg-white p-5 text-left transition-all duration-200"
          style={{ borderColor: "#E6E2DA" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F0F4EE";
            e.currentTarget.style.borderColor = "#6B8E6B";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FFFFFF";
            e.currentTarget.style.borderColor = "#E6E2DA";
          }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(107,142,107,0.08)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B8E6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <div className="text-[15px] font-extrabold" style={{ color: "#2A4B44" }}>
              Ingredient List
            </div>
            <div className="mt-0.5 text-[12px] leading-relaxed" style={{ color: "#9C8E7D" }}>
              Scan the back of the packaging to analyze the full ingredient list.
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

function Page3() {
  const [showScanOptions, setShowScanOptions] = useState(false);
  return (
    <Frame label="03 · DIAGNOSIS REPORT">
      <div className="absolute inset-0 pt-24 pb-24 overflow-hidden">
        <div className="px-6">
          <div className="text-[11px] font-bold tracking-[0.25em]" style={{ color: TEXT_SOFT }}>
            REPORT · 06.20.26
          </div>

          {/* Summary */}
          <div className="mt-3 rounded-3xl bg-white p-5" style={{ boxShadow: "0 20px 50px -24px rgba(74,68,58,0.25)" }}>
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold tracking-[0.2em]" style={{ color: BLUE }}>
                DIAGNOSIS
              </div>
              <div
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: "rgba(107,142,107,0.1)", color: BLUE }}
              >
                CONFIDENCE 96%
              </div>
            </div>
            <div
              className="mt-2 text-[24px] font-extrabold leading-tight"
              style={{ color: NAVY, letterSpacing: "-0.02em" }}
            >
              Dry & Dehydrated
              <br />
              Skin.
            </div>
            <div className="mt-3 flex gap-5 text-[11px]" style={{ color: TEXT_MUTED }}>
              <div>
                <div className="text-[18px] font-extrabold" style={{ color: NAVY }}>
                  32%
                </div>
                <div>Moisture</div>
              </div>
              <div>
                <div className="text-[18px] font-extrabold" style={{ color: NAVY }}>
                  71%
                </div>
                <div>Barrier</div>
              </div>
              <div>
                <div className="text-[18px] font-extrabold" style={{ color: NAVY }}>
                  Low
                </div>
                <div>Sebum</div>
              </div>
            </div>
          </div>

          {/* Ingredient Matrix */}
          <div className="mt-6">
            <div className="text-[11px] font-bold tracking-[0.25em]" style={{ color: TEXT_SOFT }}>
              INGREDIENT MATRIX
            </div>

            <div className="mt-3">
              <div className="text-[13px] font-extrabold" style={{ color: NAVY }}>
                Good for you
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Ceramides", "Hyaluronic Acid"].map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold"
                    style={{ color: NAVY, boxShadow: "0 6px 14px -8px rgba(74,68,58,0.18)" }}
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: BLUE }} />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-[13px] font-extrabold" style={{ color: NAVY }}>
                Avoid
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold"
                  style={{ color: NAVY, boxShadow: "0 6px 14px -8px rgba(74,68,58,0.18)" }}
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CRIMSON }} />
                  Ethanol
                </span>
              </div>
            </div>
          </div>

          {/* Recommended */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold tracking-[0.25em]" style={{ color: TEXT_SOFT }}>
                RECOMMENDED FOR YOU
              </div>
              <div className="text-[10px] font-semibold" style={{ color: BLUE }}>
                SEE ALL
              </div>
            </div>
          </div>
        </div>

        {/* horizontal scroll */}
        <div className="mt-3 flex gap-3 overflow-x-auto px-6 pb-2" style={{ scrollbarWidth: "none" }}>
          {[
            { n: "A-Cream", s: "Barrier Repair", m: 96 },
            { n: "H-Serum", s: "Deep Hydrate", m: 92 },
            { n: "C-Mask", s: "Overnight", m: 88 },
          ].map((p) => (
            <div
              key={p.n}
              className="shrink-0 rounded-2xl bg-white p-3"
              style={{ width: 140, boxShadow: "0 14px 30px -18px rgba(74,68,58,0.25)" }}
            >
              <div
                className="h-20 w-full rounded-xl flex items-center justify-center"
                style={{ backgroundColor: GRAY_BG }}
              >
                <svg width="34" height="46" viewBox="0 0 34 46" fill="none" stroke={NAVY} strokeWidth="1.5">
                  <rect x="4" y="10" width="26" height="32" rx="2" />
                  <rect x="10" y="4" width="14" height="8" rx="1" />
                  <line x1="9" y1="20" x2="25" y2="20" />
                  <line x1="9" y1="26" x2="20" y2="26" />
                </svg>
              </div>
              <div className="mt-2 text-[13px] font-extrabold" style={{ color: NAVY }}>
                {p.n}
              </div>
              <div className="text-[10px]" style={{ color: TEXT_MUTED }}>
                {p.s}
              </div>
              <div className="mt-1.5 text-[10px] font-extrabold tracking-wider" style={{ color: BLUE }}>
                AI MATCH: {p.m}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* floating action */}
      <div className="absolute bottom-6 left-6 right-6">
        <button
          className="w-full rounded-2xl py-4 text-[14px] font-bold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: BLUE, boxShadow: "0 20px 40px -14px rgba(107,142,107,0.55)" }}
          onClick={() => setShowScanOptions(true)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Scan Another Product Ingredient
        </button>
      </div>

      <ScanOptionsSheet open={showScanOptions} onClose={() => setShowScanOptions(false)} />
    </Frame>
  );
}

// ---------- Page 4: Camera ----------
function Page4() {
  return (
    <Frame label="04 · OCR SCANNER">
      {/* fake camera bg */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(120% 80% at 50% 30%, #4a5970 0%, #2b3447 45%, #141a26 100%)",
        }}
      >
        {/* faux product label */}
        <div
          className="absolute inset-x-8 top-40 bottom-40 rounded-md opacity-90"
          style={{
            background: "linear-gradient(135deg,#e8e3d6,#cdc6b5)",
            boxShadow: "0 30px 50px rgba(0,0,0,0.5)",
          }}
        >
          <div className="p-5">
            <div className="text-[10px] font-bold tracking-widest" style={{ color: "#5a533f" }}>
              INGREDIENTS
            </div>
            <div className="mt-2 text-[8px] leading-snug" style={{ color: "#3d3727" }}>
              Aqua, Glycerin, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Niacinamide, Sodium Hyaluronate,
              Tocopherol, Panthenol, Stearic Acid, Phenoxyethanol, Ethylhexylglycerin, Allantoin, Centella Asiatica
              Extract, Ceramide NP, Squalane, Butylene Glycol, Disodium EDTA, Xanthan Gum, Fragrance.
            </div>
            <div className="mt-3 text-[8px] leading-snug" style={{ color: "#3d3727" }}>
              Aqua, Glycerin, Niacinamide, Sodium Hyaluronate, Tocopherol, Panthenol, Phenoxyethanol, Allantoin,
              Squalane.
            </div>
          </div>
        </div>
      </div>

      {/* blur overlay with cutout */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(74,68,58,0.55)",
          backdropFilter: "blur(6px)",
          WebkitMaskImage:
            "radial-gradient(ellipse 0% 0%, transparent 0, transparent 0, black 0), linear-gradient(black,black)",
        }}
      />

      {/* Re-render label sharp inside scan square */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: 422,
          transform: "translate(-50%,-50%)",
          width: 260,
          height: 260,
          overflow: "hidden",
          borderRadius: 8,
        }}
      >
        <div
          className="absolute"
          style={{
            inset: -200,
            background: "linear-gradient(135deg,#e8e3d6,#cdc6b5)",
          }}
        >
          <div className="p-5" style={{ position: "absolute", left: 200, top: 200, width: 280 }}>
            <div className="text-[10px] font-bold tracking-widest" style={{ color: "#5a533f" }}>
              INGREDIENTS
            </div>
            <div className="mt-2 text-[9px] leading-snug" style={{ color: "#3d3727" }}>
              Aqua, Glycerin, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Niacinamide, Sodium Hyaluronate,
              Tocopherol, Panthenol, Stearic Acid, Phenoxyethanol, Ethylhexylglycerin, Allantoin, Centella Asiatica.
            </div>
          </div>
        </div>
      </div>

      {/* scan square outline + corners */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: 422,
          transform: "translate(-50%,-50%)",
          width: 260,
          height: 260,
          boxShadow: "0 0 0 9999px rgba(74,68,58,0.55)",
          border: "1px solid rgba(255,255,255,0.8)",
          borderRadius: 8,
        }}
      >
        {/* corner brackets */}
        {[
          { top: -2, left: -2, borderTop: "3px solid white", borderLeft: "3px solid white" },
          { top: -2, right: -2, borderTop: "3px solid white", borderRight: "3px solid white" },
          { bottom: -2, left: -2, borderBottom: "3px solid white", borderLeft: "3px solid white" },
          { bottom: -2, right: -2, borderBottom: "3px solid white", borderRight: "3px solid white" },
        ].map((s, i) => (
          <div key={i} className="absolute" style={{ width: 22, height: 22, borderRadius: 4, ...s }} />
        ))}
        {/* scan line */}
        <div
          className="absolute left-0 right-0 h-[2px] top-1/2"
          style={{ backgroundColor: BLUE, boxShadow: `0 0 14px ${BLUE}` }}
        />
      </div>

      {/* OCR badge */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 250 }}>
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[0.25em] text-white"
          style={{ backgroundColor: "rgba(107,142,107,0.9)", boxShadow: `0 8px 24px -8px ${BLUE}` }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          OCR ACTIVATE
        </div>
      </div>

      {/* instruction */}
      <div className="absolute left-0 right-0 text-center" style={{ top: 580 }}>
        <div className="text-[14px] font-bold text-white" style={{ letterSpacing: "-0.01em" }}>
          Align ingredient list inside the box.
        </div>
        <div className="mt-1 text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>
          Hold steady — auto-capture in 0.4s
        </div>
      </div>

      {/* top bar */}
      <div className="absolute top-12 left-6 right-6 flex items-center justify-between text-white">
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
        <div className="text-[11px] font-bold tracking-[0.25em]">SCAN MODE</div>
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
      </div>

      {/* shutter */}
      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center">
        <div
          className="h-20 w-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)" }}
        >
          <button
            className="h-16 w-16 rounded-full"
            style={{ backgroundColor: NAVY, boxShadow: `inset 0 0 0 4px white, 0 12px 30px -8px ${NAVY}` }}
          />
        </div>
      </div>
    </Frame>
  );
}

// ---------- Page 5: Match Result ----------
function Page5() {
  const pct = 85;
  const R = 80;
  const C = 2 * Math.PI * R;
  return (
    <Frame label="05 · MATCH RESULT">
      <div className="absolute inset-0 pt-24 pb-28 px-6 flex flex-col">
        <div className="flex items-center justify-between">
          <div
            className="h-9 w-9 rounded-full bg-white flex items-center justify-center"
            style={{ boxShadow: "0 6px 16px -8px rgba(74,68,58,0.2)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={NAVY}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </div>
          <div className="text-[11px] font-bold tracking-[0.25em]" style={{ color: TEXT_SOFT }}>
            RESULT
          </div>
          <div className="h-9 w-9" />
        </div>

        {/* gauge */}
        <div className="mt-6 self-center relative" style={{ width: 200, height: 200 }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={R} fill="none" stroke="#ECE6DA" strokeWidth="3" />
            <circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke={BLUE}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * C} ${C}`}
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[10px] font-bold tracking-[0.25em]" style={{ color: TEXT_SOFT }}>
              SAFETY SCORE
            </div>
            <div className="text-[52px] font-extrabold leading-none" style={{ color: NAVY, letterSpacing: "-0.04em" }}>
              85<span style={{ color: BLUE }}>%</span>
            </div>
            <div className="text-[10px] font-semibold" style={{ color: BLUE }}>
              RECOMMENDED
            </div>
          </div>
        </div>

        <div
          className="mt-5 text-center text-[15px] font-bold leading-snug"
          style={{ color: NAVY, letterSpacing: "-0.01em" }}
        >
          This product is 85% safe
          <br />
          for your <span style={{ color: BLUE }}>Dry</span> skin.
        </div>

        <div className="mt-7 text-[11px] font-bold tracking-[0.25em]" style={{ color: TEXT_SOFT }}>
          GOOD INGREDIENTS
        </div>
        <div
          className="mt-2 rounded-xl px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: "rgba(107,142,107,0.08)" }}
        >
          <div>
            <div className="text-[14px] font-extrabold" style={{ color: NAVY }}>
              Glycerin
            </div>
            <div className="text-[11px]" style={{ color: TEXT_MUTED }}>
              Humectant · Deep hydration
            </div>
          </div>
          <div className="text-[11px] font-extrabold" style={{ color: BLUE }}>
            +EXCELLENT
          </div>
        </div>

        <div className="mt-4 text-[11px] font-bold tracking-[0.25em]" style={{ color: TEXT_SOFT }}>
          BAD INGREDIENTS
        </div>
        <div
          className="mt-2 rounded-xl px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: "rgba(232,159,113,0.07)" }}
        >
          <div>
            <div className="text-[14px] font-extrabold" style={{ color: NAVY }}>
              Stearic Acid
            </div>
            <div className="text-[11px]" style={{ color: TEXT_MUTED }}>
              May clog pores on dry skin
            </div>
          </div>
          <div className="text-[11px] font-extrabold" style={{ color: CRIMSON }}>
            −CAUTION
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4"
        style={{ background: `linear-gradient(to top, ${GRAY_BG} 70%, rgba(250,247,242,0))` }}
      >
        <button
          className="w-full rounded-2xl py-4 text-[15px] font-bold text-white"
          style={{ backgroundColor: BLUE, boxShadow: `0 20px 40px -14px ${BLUE}` }}
        >
          Add to My Vanity +
        </button>
      </div>
    </Frame>
  );
}

// ---------- Page 5-1: Virtual Vanity Main View ----------
type VanityCategory = "cream" | "toner" | "lotion" | "tools" | "mirror";

function Page5_1() {
  const [active, setActive] = useState<VanityCategory | null>(null);
  const [hover, setHover] = useState<VanityCategory | null>(null);

  const data: Record<VanityCategory, { title: string; items: { name: string; life: string; safe: "Safe" | "Check" }[] }> = {
    cream: {
      title: "My Creams",
      items: [
        { name: "Barrier Recovery Cream", life: "4 mo left", safe: "Safe" },
        { name: "Night Repair Jar", life: "2 mo left", safe: "Check" },
      ],
    },
    toner: {
      title: "My Toners & Skins",
      items: [
        { name: "Centella Hydrating Toner", life: "6 mo left", safe: "Safe" },
        { name: "PHA Glow Essence", life: "3 mo left", safe: "Safe" },
      ],
    },
    lotion: {
      title: "My Lotions",
      items: [{ name: "Ceramide Daily Lotion", life: "5 mo left", safe: "Safe" }],
    },
    tools: {
      title: "My Makeup Tools",
      items: [
        { name: "Kabuki Brush", life: "Clean: 3d ago", safe: "Safe" },
        { name: "Blending Sponge", life: "Replace soon", safe: "Check" },
      ],
    },
    mirror: {
      title: "Vanity Mirror",
      items: [{ name: "Daily Skin Check", life: "Last: today", safe: "Safe" }],
    },
  };

  const WOOD = "#D8B68A";
  const WOOD_DARK = "#B89368";
  const CREAM = "#FAF7F2";

  const Silhouette = ({
    cat,
    children,
    w,
    h,
  }: {
    cat: VanityCategory;
    children: React.ReactNode;
    w: number;
    h: number;
  }) => {
    const isActive = hover === cat || active === cat;
    return (
      <button
        onMouseEnter={() => setHover(cat)}
        onMouseLeave={() => setHover(null)}
        onClick={() => setActive(cat)}
        className="relative flex items-end justify-center transition-all"
        style={{
          width: w,
          height: h,
          opacity: isActive ? 1 : 0.6,
          filter: isActive ? `drop-shadow(0 0 10px ${BLUE})` : "none",
          transform: isActive ? "translateY(-2px)" : "none",
        }}
        aria-label={cat}
      >
        {children}
      </button>
    );
  };

  return (
    <Frame label="05·1 · MY VANITY">
      <div className="absolute inset-0 pt-16 px-6 flex flex-col">
        <div className="text-[11px] font-bold tracking-[0.25em]" style={{ color: TEXT_SOFT }}>
          MY VANITY
        </div>
        <div className="text-[24px] font-extrabold mt-0.5" style={{ color: NAVY, letterSpacing: "-0.02em" }}>
          Virtual Vanity Table
        </div>
        <div className="text-[12px] mt-1" style={{ color: TEXT_MUTED }}>
          Tap an item to view your products
        </div>

        <div className="mt-6 relative flex-1 flex flex-col items-center justify-start">
          <div
            className="absolute"
            style={{
              top: 0,
              width: 220,
              height: 240,
              borderRadius: "50%",
              background: `radial-gradient(closest-side, ${BLUE}33, transparent 70%)`,
              filter: "blur(8px)",
            }}
          />

          <Silhouette cat="mirror" w={170} h={200}>
            <div
              className="absolute inset-0"
              style={{
                borderRadius: "50% / 48%",
                background: "linear-gradient(180deg, #FFFFFF 0%, #F4EEE3 100%)",
                border: `6px solid ${WOOD}`,
                boxShadow: "inset 0 12px 28px rgba(255,255,255,0.9), 0 16px 30px -18px rgba(74,68,58,0.35)",
              }}
            />
          </Silhouette>

          <div
            className="relative mt-2 w-full rounded-[18px] flex items-end justify-around px-4"
            style={{
              height: 110,
              background: "linear-gradient(180deg,#FFFFFF 0%,#FBF6EC 100%)",
              border: `1px solid ${WOOD}55`,
              boxShadow: "0 18px 36px -20px rgba(74,68,58,0.25)",
              paddingBottom: 10,
            }}
          >
            <Silhouette cat="cream" w={46} h={56}>
              <div className="absolute bottom-0 left-0 right-0" style={{ height: 38, borderRadius: "8px 8px 12px 12px", background: NAVY }} />
              <div className="absolute left-2 right-2" style={{ bottom: 36, height: 8, borderRadius: 3, background: WOOD_DARK }} />
            </Silhouette>

            <Silhouette cat="toner" w={28} h={84}>
              <div className="absolute bottom-0 left-0 right-0" style={{ height: 70, borderRadius: "10px 10px 6px 6px", background: NAVY }} />
              <div className="absolute left-[9px] right-[9px]" style={{ bottom: 70, height: 10, background: WOOD_DARK, borderRadius: 2 }} />
            </Silhouette>

            <Silhouette cat="lotion" w={36} h={80}>
              <div className="absolute bottom-0 left-0 right-0" style={{ height: 58, borderRadius: "8px 8px 10px 10px", background: BLUE }} />
              <div className="absolute left-[13px] right-[13px]" style={{ bottom: 58, height: 14, background: NAVY, borderRadius: 2 }} />
              <div className="absolute left-[6px]" style={{ bottom: 70, width: 16, height: 4, background: NAVY, borderRadius: 2 }} />
            </Silhouette>

            <Silhouette cat="tools" w={44} h={88}>
              <div className="absolute bottom-0 left-0 right-0" style={{ height: 34, borderRadius: "6px 6px 10px 10px", background: "#EFE6D5", border: `1.5px solid ${WOOD}` }} />
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    bottom: 28,
                    left: 6 + i * 12,
                    width: 6,
                    height: 50 + i * 4,
                    background: i === 1 ? WOOD_DARK : NAVY,
                    borderRadius: 3,
                  }}
                />
              ))}
            </Silhouette>
          </div>

          <div
            className="mt-3 w-full rounded-[14px] grid grid-cols-3 gap-2 p-3"
            style={{
              background: `linear-gradient(180deg, ${WOOD} 0%, ${WOOD_DARK} 100%)`,
              boxShadow: "0 20px 40px -22px rgba(74,68,58,0.4)",
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-[8px] flex items-center justify-center"
                style={{
                  height: 44,
                  background: "linear-gradient(180deg,#E6C79A,#C9A678)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
                }}
              >
                <div className="h-1.5 w-6 rounded-full" style={{ background: NAVY, opacity: 0.5 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {active && (
        <>
          <button
            aria-label="Close overlay"
            onClick={() => setActive(null)}
            className="absolute inset-0 animate-fade-in"
            style={{ background: "rgba(40,40,30,0.35)", zIndex: 60 }}
          />
          <div
            className="absolute left-0 right-0 bottom-0 rounded-t-[28px] px-5 pt-3 pb-6 animate-fade-in"
            style={{
              background: CREAM,
              zIndex: 70,
              boxShadow: "0 -20px 50px -10px rgba(74,68,58,0.3)",
            }}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full" style={{ background: "#D9D1C2" }} />
            <div className="flex items-center justify-between">
              <div className="text-[18px] font-extrabold" style={{ color: NAVY, letterSpacing: "-0.01em" }}>
                {data[active].title}
              </div>
              <button
                onClick={() => setActive(null)}
                className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[14px] font-bold"
                style={{ color: NAVY, boxShadow: "0 6px 14px -8px rgba(74,68,58,0.25)" }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="mt-1 text-[12px]" style={{ color: TEXT_MUTED }}>
              {data[active].items.length} items in your vanity
            </div>

            <div className="mt-4 flex flex-col gap-2.5 max-h-[280px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {data[active].items.map((it) => (
                <div
                  key={it.name}
                  className="rounded-2xl bg-white px-4 py-3 flex items-center justify-between"
                  style={{ boxShadow: "0 10px 22px -16px rgba(74,68,58,0.18)" }}
                >
                  <div className="flex-1">
                    <div className="text-[14px] font-extrabold" style={{ color: NAVY }}>
                      {it.name}
                    </div>
                    <div className="mt-0.5 text-[11px]" style={{ color: TEXT_MUTED }}>
                      {it.life}
                    </div>
                  </div>
                  <div
                    className="rounded-full px-2.5 py-1 text-[10px] font-extrabold"
                    style={{
                      backgroundColor: it.safe === "Safe" ? `${BLUE}1A` : `${CRIMSON}1A`,
                      color: it.safe === "Safe" ? BLUE : CRIMSON,
                    }}
                  >
                    {it.safe === "Safe" ? "✓ Safe" : "⚠ Check"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Frame>
  );
}

// ---------- Page 6: Vanity Routine ----------
function Page6() {
  const recommendations = [
    { match: 98, name: "C-Ampoule", sub: "15% L-ascorbic acid · Brightening" },
    { match: 96, name: "Barrier Recovery Cream", sub: "Ceramide-rich · Deep hydration" },
  ];

  return (
    <Frame label="06 · MY VANITY">
      <div className="absolute inset-0 pt-24 px-6 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-[0.25em]" style={{ color: TEXT_SOFT }}>
              EVENING · MON
            </div>
            <div className="text-[24px] font-extrabold mt-0.5" style={{ color: NAVY, letterSpacing: "-0.02em" }}>
              My Vanity Routine
            </div>
          </div>
          <div
            className="h-10 w-10 rounded-full bg-white flex items-center justify-center"
            style={{ boxShadow: "0 6px 16px -8px rgba(74,68,58,0.2)" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={NAVY}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
        </div>

        {/* segmented */}
        <div className="mt-5 rounded-full p-1 flex" style={{ backgroundColor: "#ECE6DA" }}>
          <div className="flex-1 text-center py-2 text-[12px] font-bold rounded-full" style={{ color: TEXT_MUTED }}>
            ☀ AM
          </div>
          <div
            className="flex-1 text-center py-2 text-[12px] font-bold rounded-full text-white"
            style={{ backgroundColor: BLUE, boxShadow: `0 8px 20px -8px ${BLUE}` }}
          >
            ☾ PM
          </div>
        </div>

        {/* timeline */}
        <div className="mt-6 relative">
          <div className="absolute left-[18px] top-2 bottom-2 w-px" style={{ backgroundColor: "#ECE6DA" }} />

          {/* step 1 */}
          <div className="flex gap-3 items-start">
            <div
              className="relative z-10 mt-1 h-9 w-9 rounded-full bg-white flex items-center justify-center text-[11px] font-extrabold"
              style={{ color: BLUE, boxShadow: "0 6px 14px -6px rgba(107,142,107,0.4)" }}
            >
              01
            </div>
            <div
              className="flex-1 rounded-2xl bg-white px-4 py-3"
              style={{ boxShadow: "0 12px 26px -16px rgba(74,68,58,0.2)" }}
            >
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-extrabold" style={{ color: NAVY }}>
                  STEP 1: A-Serum
                </div>
                <div className="text-[10px]" style={{ color: TEXT_SOFT }}>
                  2 drops
                </div>
              </div>
              <div
                className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: "rgba(107,142,107,0.1)", color: BLUE }}
              >
                #Vit_C
              </div>
            </div>
          </div>

          {/* inline conflict warning */}
          <div
            className="relative z-10 mt-3 ml-12 rounded-xl px-3 py-2 flex items-center gap-2"
            style={{ backgroundColor: `${CRIMSON}10`, border: `1px dashed ${CRIMSON}40` }}
          >
            <span className="text-[13px]">⚠️</span>
            <span className="text-[11px] font-extrabold" style={{ color: CRIMSON }}>
              Conflict Detected! (Vitamin C + Retinol)
            </span>
          </div>

          {/* step 2 */}
          <div className="flex gap-3 items-start mt-4">
            <div
              className="relative z-10 mt-1 h-9 w-9 rounded-full bg-white flex items-center justify-center text-[11px] font-extrabold"
              style={{ color: NAVY, boxShadow: "0 6px 14px -6px rgba(74,68,58,0.2)" }}
            >
              02
            </div>
            <div
              className="flex-1 rounded-2xl bg-white px-4 py-3"
              style={{ boxShadow: "0 12px 26px -16px rgba(74,68,58,0.2)" }}
            >
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-extrabold" style={{ color: NAVY }}>
                  STEP 2: B-Cream
                </div>
                <div className="text-[10px]" style={{ color: TEXT_SOFT }}>
                  pea size
                </div>
              </div>
              <div
                className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: "rgba(107,142,107,0.1)", color: BLUE }}
              >
                #Retinol
              </div>
            </div>
          </div>
        </div>

        {/* AI Personal Recommendations */}
        <div className="mt-8">
          <div className="text-[16px] font-extrabold" style={{ color: NAVY, letterSpacing: "-0.01em" }}>
            AI Personal Recommendations
          </div>
          <div className="mt-1 text-[12px] font-semibold" style={{ color: TEXT_MUTED }}>
            Saved safe alternatives for your routine
          </div>
        </div>

        {/* recommendation cards */}
        <div className="mt-4 flex flex-col gap-3 pb-6">
          {recommendations.map((r) => (
            <div
              key={r.name}
              className="rounded-2xl bg-white px-4 py-3.5 flex flex-col"
              style={{ boxShadow: "0 10px 24px -16px rgba(74,68,58,0.18)" }}
            >
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-extrabold tracking-wider" style={{ color: BLUE }}>
                  {r.match}% Match
                </div>
              </div>
              <div className="mt-1 text-[15px] font-extrabold" style={{ color: NAVY, letterSpacing: "-0.01em" }}>
                {r.name}
              </div>
              <div className="mt-0.5 text-[11px]" style={{ color: TEXT_MUTED }}>
                {r.sub}
              </div>
              <div className="mt-3 flex items-center gap-4">
                <button className="text-[12px] font-bold" style={{ color: TEXT_MUTED }}>
                  Buy Now 🛒
                </button>
                <button className="text-[12px] font-bold flex items-center gap-1" style={{ color: BLUE }}>
                  Add to Routine <span className="text-[13px]">➕</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// ---------- Page 6-1: Vanity & Smart Feed ----------
function Page6_1() {
  const smartFeed = [
    {
      title: "✨ NEW Product Match",
      badge: "97% Match",
      badgeColor: BLUE,
      desc: "A newly released ultra-gentle hydrating serum specifically formulated for dry skin. Contains 5 Ceramides and Hyaluronic Acid complex.",
      actions: ["View Analysis", "Find Alternatives"],
    },
    {
      title: "🔄 Warning: Formula Renewal",
      badge: "Score Dropped: 92% to 45% 🔴",
      badgeColor: CRIMSON,
      desc: "Your saved toner 'Aqua Balance Toner' has added Ethanol in its new renewal formula. We recommend reviewing compatibility.",
      actions: ["View Analysis", "Find Alternatives"],
    },
  ];

  return (
    <Frame label="06-1 · VANITY & SMART FEED">
      <div className="absolute inset-0 pt-24 pb-6 px-6 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-[0.25em]" style={{ color: TEXT_SOFT }}>
              EVENING · MON
            </div>
            <div className="text-[24px] font-extrabold mt-0.5" style={{ color: NAVY, letterSpacing: "-0.02em" }}>
              My Vanity & Smart Feed
            </div>
          </div>
          <div
            className="h-10 w-10 rounded-full bg-white flex items-center justify-center"
            style={{ boxShadow: "0 6px 16px -8px rgba(74,68,58,0.2)" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={NAVY}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
        </div>

        {/* AM / PM segmented */}
        <div className="mt-5 rounded-full p-1 flex" style={{ backgroundColor: "#ECE6DA" }}>
          <div className="flex-1 text-center py-2 text-[12px] font-bold rounded-full" style={{ color: TEXT_MUTED }}>
            ☀ AM
          </div>
          <div
            className="flex-1 text-center py-2 text-[12px] font-bold rounded-full text-white"
            style={{ backgroundColor: BLUE, boxShadow: `0 8px 20px -8px ${BLUE}` }}
          >
            ☾ PM
          </div>
        </div>

        {/* horizontal timeline cards */}
        <div className="mt-5 flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          <div
            className="shrink-0 rounded-2xl bg-white px-4 py-3.5 flex flex-col"
            style={{ width: 160, boxShadow: "0 12px 26px -16px rgba(74,68,58,0.2)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-[10px] font-extrabold"
                style={{ color: BLUE, boxShadow: "0 4px 10px -4px rgba(107,142,107,0.4)" }}
              >
                01
              </div>
              <div className="text-[13px] font-extrabold" style={{ color: NAVY }}>
                A-Serum
              </div>
            </div>
            <div className="mt-2 text-[11px]" style={{ color: TEXT_MUTED }}>
              Vitamin C
            </div>
            <div
              className="mt-1 inline-block self-start rounded-full px-2 py-0.5 text-[9px] font-bold"
              style={{ backgroundColor: "rgba(107,142,107,0.1)", color: BLUE }}
            >
              #Vit_C
            </div>
          </div>

          <div
            className="shrink-0 rounded-2xl bg-white px-4 py-3.5 flex flex-col"
            style={{ width: 160, boxShadow: "0 12px 26px -16px rgba(74,68,58,0.2)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-[10px] font-extrabold"
                style={{ color: NAVY, boxShadow: "0 4px 10px -4px rgba(74,68,58,0.2)" }}
              >
                02
              </div>
              <div className="text-[13px] font-extrabold" style={{ color: NAVY }}>
                B-Cream
              </div>
            </div>
            <div className="mt-2 text-[11px]" style={{ color: TEXT_MUTED }}>
              Retinol
            </div>
            <div
              className="mt-1 inline-block self-start rounded-full px-2 py-0.5 text-[9px] font-bold"
              style={{ backgroundColor: "rgba(107,142,107,0.1)", color: BLUE }}
            >
              #Retinol
            </div>
          </div>
        </div>

        {/* AI Smart Feed header */}
        <div className="mt-8">
          <div className="text-[16px] font-extrabold" style={{ color: NAVY, letterSpacing: "-0.01em" }}>
            🔔 AI Smart Feed
          </div>
          <div className="mt-1 text-[12px] font-semibold" style={{ color: TEXT_MUTED }}>
            Personalized alerts & discoveries for your skin
          </div>
        </div>

        {/* smart feed cards */}
        <div className="mt-4 flex flex-col gap-3 pb-4">
          {smartFeed.map((card, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white px-5 pt-4 pb-4 flex flex-col"
              style={{ boxShadow: "0 14px 34px -18px rgba(74,68,58,0.22)" }}
            >
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-extrabold" style={{ color: NAVY }}>
                  {card.title}
                </div>
              </div>
              <div
                className="mt-2 inline-block self-start rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wider"
                style={{ color: card.badgeColor, backgroundColor: `${card.badgeColor}14` }}
              >
                {card.badge}
              </div>
              <p className="mt-3 text-[12px] leading-relaxed" style={{ color: TEXT_MUTED }}>
                {card.desc}
              </p>
              <div className="mt-4 flex items-center gap-5">
                <button className="text-[12px] font-bold" style={{ color: TEXT_MUTED }}>
                  {card.actions[0]}
                </button>
                <button className="text-[12px] font-bold flex items-center gap-1" style={{ color: BLUE }}>
                  {card.actions[1]}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// ---------- Page 6-2: Conflict Resolution Bottom Sheet ----------
function Page6_2() {
  return (
    <Frame label="06-2 · CONFLICT RESOLUTION">
      <div className="absolute inset-0 pt-24 px-6" style={{ scrollbarWidth: "none" }}>
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-[0.25em]" style={{ color: TEXT_SOFT }}>
              EVENING · MON
            </div>
            <div className="text-[24px] font-extrabold mt-0.5" style={{ color: NAVY, letterSpacing: "-0.02em" }}>
              My Vanity Routine
            </div>
          </div>
          <div
            className="h-10 w-10 rounded-full bg-white flex items-center justify-center"
            style={{ boxShadow: "0 6px 16px -8px rgba(74,68,58,0.2)" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={NAVY}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
        </div>

        {/* segmented */}
        <div className="mt-5 rounded-full p-1 flex" style={{ backgroundColor: "#ECE6DA" }}>
          <div className="flex-1 text-center py-2 text-[12px] font-bold rounded-full" style={{ color: TEXT_MUTED }}>
            ☀ AM
          </div>
          <div
            className="flex-1 text-center py-2 text-[12px] font-bold rounded-full text-white"
            style={{ backgroundColor: BLUE, boxShadow: `0 8px 20px -8px ${BLUE}` }}
          >
            ☾ PM
          </div>
        </div>

        {/* timeline with conflict */}
        <div className="mt-6 relative">
          <div className="absolute left-[18px] top-2 bottom-2 w-px" style={{ backgroundColor: "#ECE6DA" }} />

          <div className="flex gap-3 items-start">
            <div
              className="relative z-10 mt-1 h-9 w-9 rounded-full bg-white flex items-center justify-center text-[11px] font-extrabold"
              style={{ color: BLUE, boxShadow: "0 6px 14px -6px rgba(107,142,107,0.4)" }}
            >
              01
            </div>
            <div
              className="flex-1 rounded-2xl bg-white px-4 py-3"
              style={{ boxShadow: "0 12px 26px -16px rgba(74,68,58,0.2)" }}
            >
              <div className="text-[14px] font-extrabold" style={{ color: NAVY }}>
                STEP 1: A-Serum (#Vit_C)
              </div>
            </div>
          </div>

          <div
            className="relative z-10 mt-3 ml-12 rounded-xl px-3 py-2 flex items-center gap-2"
            style={{ backgroundColor: `${CRIMSON}10`, border: `1px dashed ${CRIMSON}40` }}
          >
            <span className="text-[13px]">⚠️</span>
            <span className="text-[11px] font-extrabold" style={{ color: CRIMSON }}>
              Conflict Detected! (Vitamin C + Retinol)
            </span>
          </div>

          <div className="flex gap-3 items-start mt-3">
            <div
              className="relative z-10 mt-1 h-9 w-9 rounded-full bg-white flex items-center justify-center text-[11px] font-extrabold"
              style={{ color: NAVY, boxShadow: "0 6px 14px -6px rgba(74,68,58,0.2)" }}
            >
              02
            </div>
            <div
              className="flex-1 rounded-2xl bg-white px-4 py-3"
              style={{ boxShadow: "0 12px 26px -16px rgba(74,68,58,0.2)" }}
            >
              <div className="text-[14px] font-extrabold" style={{ color: NAVY }}>
                STEP 2: B-Cream (#Retinol)
              </div>
            </div>
          </div>
        </div>

        {/* dim scrim hint */}
        <div
          className="absolute inset-x-0 bottom-0 top-1/2"
          style={{
            background: "linear-gradient(to bottom, rgba(74,68,58,0) 0%, rgba(74,68,58,0.35) 60%)",
            pointerEvents: "none",
          }}
        />

        {/* bottom sheet */}
        <div
          className="absolute left-0 right-0 bottom-0 rounded-t-[28px] bg-white px-6 pt-4 pb-8"
          style={{ boxShadow: "0 -20px 60px -20px rgba(74,68,58,0.35)" }}
        >
          <div className="mx-auto h-1.5 w-12 rounded-full" style={{ backgroundColor: "#ECE6DA" }} />

          <div className="mt-4 flex items-center gap-2">
            <div className="text-[10px] font-extrabold tracking-[0.25em]" style={{ color: BLUE }}>
              AI RESOLUTION
            </div>
            <div className="flex-1 h-px" style={{ backgroundColor: "#ECE6DA" }} />
          </div>

          <div
            className="mt-3 text-[18px] font-extrabold leading-snug"
            style={{ color: NAVY, letterSpacing: "-0.01em" }}
          >
            Solution! Split: AM / PM.
          </div>
          <div className="mt-1 text-[13px] font-bold" style={{ color: CRIMSON }}>
            Move Vitamin C to Morning.
          </div>
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: TEXT_MUTED }}>
            Separating these actives reduces irritation and preserves potency. Apply A-Serum in your AM routine, keep
            B-Cream in PM.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <button
              className="flex-1 rounded-2xl py-3.5 text-[13px] font-bold bg-white"
              style={{ color: NAVY, boxShadow: "inset 0 0 0 1.5px #ECE6DA" }}
            >
              Adjust Cycle
            </button>
            <button
              className="flex-1 rounded-2xl py-3.5 text-[13px] font-bold text-white"
              style={{ backgroundColor: BLUE, boxShadow: `0 14px 30px -12px ${BLUE}` }}
            >
              Apply AM/PM Split
            </button>
          </div>
        </div>
      </div>
    </Frame>
  );
}
function Page7() {
  const products = [
    {
      name: "C-Ampoule",
      desc: "Ultra-concentrated Vitamin C with 15% L-ascorbic acid. Brightens and firms while supporting collagen synthesis.",
      match: 98,
    },
    {
      name: "Barrier Recovery Cream",
      desc: "Ceramide-rich moisturizer with squalane and panthenol. Rebuilds lipid barrier for lasting hydration.",
      match: 96,
    },
  ];

  return (
    <Frame label="07 · AI RECOMMENDATION">
      <div className="absolute inset-0 pt-24 pb-28 px-6 flex flex-col">
        <div className="flex items-center justify-between">
          <div
            className="h-9 w-9 rounded-full bg-white flex items-center justify-center"
            style={{ boxShadow: "0 6px 16px -8px rgba(74,68,58,0.2)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={NAVY}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </div>
          <div className="text-[11px] font-bold tracking-[0.25em]" style={{ color: TEXT_SOFT }}>
            RECOMMENDED
          </div>
          <div className="h-9 w-9" />
        </div>

        <h1 className="mt-6 text-[28px] font-extrabold leading-tight" style={{ color: NAVY, letterSpacing: "-0.02em" }}>
          AI Recommendation
        </h1>
        <p className="mt-2 text-[13px] leading-snug" style={{ color: TEXT_MUTED }}>
          Safe alternatives for your{" "}
          <span className="font-bold" style={{ color: NAVY }}>
            Dry
          </span>{" "}
          skin and{" "}
          <span className="font-bold" style={{ color: BLUE }}>
            #Hydration
          </span>{" "}
          concerns.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {products.map((p) => (
            <div
              key={p.name}
              className="rounded-3xl bg-white px-5 pt-4 pb-4 flex flex-col"
              style={{ boxShadow: "0 20px 50px -24px rgba(74,68,58,0.25)" }}
            >
              <div
                className="self-start rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wider"
                style={{ color: BLUE, backgroundColor: "rgba(107,142,107,0.08)" }}
              >
                Safe Match {p.match}%
              </div>

              <div className="mt-3 text-[18px] font-extrabold" style={{ color: NAVY, letterSpacing: "-0.01em" }}>
                {p.name}
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: TEXT_MUTED }}>
                {p.desc}
              </p>

              <div className="mt-4 flex items-center gap-5">
                <button className="text-[12px] font-bold" style={{ color: TEXT_MUTED }}>
                  View Details
                </button>
                <button className="text-[12px] font-bold flex items-center gap-1" style={{ color: BLUE }}>
                  Add to Vanity <span className="text-[13px]">➕</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4"
        style={{ background: `linear-gradient(to top, ${GRAY_BG} 70%, rgba(250,247,242,0))` }}
      >
        <button
          className="w-full rounded-2xl py-4 text-[15px] font-bold text-white"
          style={{ backgroundColor: NAVY, boxShadow: "0 18px 40px -16px rgba(47,79,79,0.6)" }}
        >
          Go to My Vanity Routine →
        </button>
      </div>
    </Frame>
  );
}

function VannyLogo({ size = 28 }: { size?: number }) {
  const c = "oklch(0.42 0.04 145.0)";
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 32 32" fill={c} aria-hidden>
        <ellipse cx="11" cy="7" rx="2.4" ry="5" />
        <ellipse cx="21" cy="7" rx="2.4" ry="5" />
        <path d="M6 16a10 10 0 0 1 20 0v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
      </svg>
      <span className="text-[18px] font-semibold lowercase" style={{ color: c, letterSpacing: "0.18em" }}>
        vanny
      </span>
    </div>
  );
}

// ---------- Page 0: Profile Setup (Onboarding) ----------
function Page0() {
  const OLIVE = "oklch(0.42 0.04 145.0)";
  const SAGE_SOFT = "oklch(0.92 0.03 145.0)";
  const BEIGE_BORDER = "oklch(0.92 0.005 75.0)";
  const CREAM = "#FAF7F2";
  const TEXT_DARK = "oklch(0.30 0.02 80)";
  const TEXT_M = "oklch(0.55 0.02 80)";

  const genders = ["Female", "Male", "Neutral"];
  const ages = ["Teens", "20s", "30s", "40s+"];
  const selectedGender = "Female";
  const selectedAge = "20s";

  return (
    <Frame label="00 · PROFILE SETUP">
      <div
        className="absolute inset-0 flex flex-col px-5"
        style={{ backgroundColor: CREAM, paddingTop: 44, paddingBottom: 24 }}
      >
        <div
          className="mt-4 flex-1 rounded-[32px] bg-white px-6 pt-7 pb-6 flex flex-col"
          style={{
            boxShadow: "0 30px 60px -28px rgba(120,108,90,0.25), 0 10px 30px -16px rgba(120,108,90,0.18)",
          }}
        >
          {/* <div className="flex justify-center">
            <VannyLogo size={30} />
          </div> */}

          <div className="mt-5 flex items-center justify-center gap-3">
            <div className="h-12 w-12 shrink-0">
              <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                  <linearGradient id="vannyRose" x1="256" y1="72" x2="256" y2="440" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#C8798D" />
                    <stop offset="1" stopColor="#D99AA6" />
                  </linearGradient>
                  <mask id="bunnyCutout">
                    <rect width="512" height="512" fill="white" />
                    <path
                      fill="black"
                      d="M246 368 C238 352 234 336 235 319 C236 295 248 276 268 266 C276 262 285 259 295 258 C304 235 320 211 339 190 C352 176 366 171 375 178 C386 186 381 205 369 222 C359 237 349 250 340 260 C359 271 372 291 378 318 C383 342 381 364 374 383 C387 382 400 387 407 399 C414 411 411 426 400 434 C390 441 375 442 363 436 C337 449 298 448 272 434 C259 438 242 438 232 428 C221 418 224 400 238 393 C243 390 250 388 256 389 C253 382 249 375 246 368 Z"
                    />
                    <circle cx="293" cy="292" r="10" fill="white" />
                  </mask>
                </defs>
                <path
                  mask="url(#bunnyCutout)"
                  fill="url(#vannyRose)"
                  d="M128 432 L128 220 C128 137 185 72 256 72 C327 72 384 137 384 220 L384 432 L315 432 C309 432 304 427 304 421 L304 410 C304 404 299 399 293 399 L219 399 C213 399 208 404 208 410 L208 421 C208 427 203 432 197 432 Z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h1
                className="text-[20px] font-semibold leading-snug"
                style={{ color: TEXT_DARK, letterSpacing: "0.005em" }}
              >
                Welcome to Vanny!
              </h1>
              <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: TEXT_M, letterSpacing: "0.01em" }}>
                Let's set up your virtual vanity table.
              </p>
            </div>
          </div>

          <div className="mt-7">
            <label className="block text-[11px] font-semibold tracking-[0.18em] mb-2" style={{ color: TEXT_M }}>
              YOUR NAME
            </label>
            <input
              type="text"
              placeholder="What should we call you?"
              className="w-full rounded-2xl px-4 py-3.5 text-[14px] outline-none bg-white"
              style={{
                border: `1px solid ${BEIGE_BORDER}`,
                color: TEXT_DARK,
                letterSpacing: "0.01em",
                boxShadow: "0 4px 14px -10px rgba(120,108,90,0.18)",
              }}
            />
          </div>

          <div className="mt-5">
            <label className="block text-[11px] font-semibold tracking-[0.18em] mb-2" style={{ color: TEXT_M }}>
              GENDER
            </label>
            <div className="flex p-1 rounded-full" style={{ backgroundColor: "oklch(0.96 0.01 80)" }}>
              {genders.map((g) => {
                const active = g === selectedGender;
                return (
                  <button
                    key={g}
                    className="flex-1 rounded-full py-2 text-[12.5px] font-medium transition"
                    style={{
                      backgroundColor: active ? SAGE_SOFT : "transparent",
                      color: active ? OLIVE : TEXT_M,
                      letterSpacing: "0.04em",
                      boxShadow: active ? "0 6px 14px -10px rgba(80,110,80,0.4)" : "none",
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-[11px] font-semibold tracking-[0.18em] mb-2" style={{ color: TEXT_M }}>
              AGE GROUP
            </label>
            <div className="flex flex-wrap gap-2">
              {ages.map((a) => {
                const active = a === selectedAge;
                return (
                  <button
                    key={a}
                    className="px-4 py-2 rounded-full text-[12.5px] font-medium"
                    style={{
                      backgroundColor: active ? SAGE_SOFT : "white",
                      color: active ? OLIVE : TEXT_M,
                      border: `1px solid ${active ? SAGE_SOFT : BEIGE_BORDER}`,
                      letterSpacing: "0.04em",
                      boxShadow: active
                        ? "0 6px 14px -10px rgba(80,110,80,0.35)"
                        : "0 3px 10px -8px rgba(120,108,90,0.15)",
                    }}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1" />

          <button
            className="mt-6 w-full rounded-full py-4 text-[14px] font-semibold text-white"
            style={{
              backgroundColor: OLIVE,
              letterSpacing: "0.08em",
              boxShadow: "0 20px 40px -16px rgba(60,90,60,0.5)",
            }}
          >
            Let's Begin
          </button>
        </div>
      </div>
    </Frame>
  );
}

function Index() {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#F2EDE3" }}>
      <header className="mx-auto max-w-7xl px-8 pt-8 pb-6">
        <div className="text-[11px] font-bold tracking-[0.3em]" style={{ color: TEXT_MUTED }}>
          VANNY · COZY BEAUTY CONCEPT
        </div>
        <h1 className="mt-2 text-4xl font-extrabold" style={{ color: NAVY, letterSpacing: "-0.03em" }}>
          Your cozy virtual vanity table.
        </h1>
      </header>

      <main className="mx-auto max-w-7xl px-8 pb-24">
        <div
          className="grid gap-12 justify-items-center"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(390px, max-content))" }}
        >
          <Page0 />
          <Page1 />
          <Page2 />
          <Page3 />
          <Page4 />
          <Page5 />
          <Page5_1 />
          <Page6 />
          <Page6_1 />
          <Page6_2 />
          <Page7 />
        </div>
      </main>
    </div>
  );
}

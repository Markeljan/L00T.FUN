"use client";

import {
  Coins,
  HelpCircle,
  PartyPopper,
  Rocket,
  RotateCw,
  Swords,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import WalletConnect from "@/components/WalletConnect";
import { cn } from "@/lib/utils";

type Phase = "idle" | "spinning" | "bust" | "won";

const COLORS = {
  baseBlue: "#0000FF",
  bg: "#0A0B0D",
  green: "#66C800",
  red: "#FC401F",
  yellow: "#FFD12F",
  cerulean: "#3C8AFF",
};

export default function Page() {
  return (
    <main className="min-h-dvh w-full" style={{ backgroundColor: COLORS.bg }}>
      <div className="mx-auto max-w-screen-md px-3 pb-28 pt-3 sm:pt-6">
        <Header />
        <Ticker />
        <Game />
      </div>
      <BottomDock />
    </main>
  );
}

function Header() {
  const [muted, setMuted] = useState(true);
  return (
    <header className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          aria-hidden
          className="grid size-7 grid-cols-2 gap-0.5 rounded-sm"
          style={{ filter: `drop-shadow(0 0 12px ${COLORS.baseBlue})` }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{ backgroundColor: COLORS.baseBlue }}
            />
          ))}
        </div>
        <span className="text-lg font-semibold tracking-wide text-white/90">
          L00T.fun
        </span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-white/15 bg-white/5 text-white hover:bg-white/10 px-2 sm:px-3"
              aria-label="How it works"
            >
              <HelpCircle className="size-4" />
              <span className="ml-2 hidden sm:inline">How it works</span>
            </Button>
          </DialogTrigger>
          <HowToPlay />
        </Dialog>
        <WalletConnect className="z-10" />
        <Button
          size="icon"
          variant="outline"
          className="border-white/15 bg-white/5 text-white/80 hover:text-white"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )}
        </Button>
      </div>
    </header>
  );
}

function HowToPlay() {
  return (
    <DialogContent className="max-w-md border-white/10 bg-black text-white">
      <DialogHeader>
        <DialogTitle className="text-center text-xl">
          How to Play — Orbital Lock
        </DialogTitle>
      </DialogHeader>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-[#c0f28a]">
        <li>Place your stake in ETH</li>
        <li>Tap Start to begin the round</li>
        <li>Press Lock when the rotating marker is inside the blue safe arc</li>
        <li>Each success shrinks the arc and increases your multiplier</li>
        <li>Miss the arc and you bust to 0</li>
        <li>Cash out anytime to secure your payout</li>
      </ol>
      <Accordion type="single" collapsible className="mt-3">
        <AccordionItem value="fair">
          <AccordionTrigger className="text-sm">Provably Fair</AccordionTrigger>
          <AccordionContent className="text-sm text-white/70">
            Results will be generated on Base using verifiable randomness. Demo
            uses client simulation. House edge 3%.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="multiplier">
          <AccordionTrigger className="text-sm">
            Multiplier Growth
          </AccordionTrigger>
          <AccordionContent className="text-sm text-white/70">
            Smaller safe arcs pay more. Your multiplier scales each round:
            higher risk, higher reward. Legendary runs glow gold.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="responsible">
          <AccordionTrigger className="text-sm">
            Responsible Gaming
          </AccordionTrigger>
          <AccordionContent className="text-sm text-white/70">
            Set max loss limits, session reminders, and self-exclusion in
            Settings. Take breaks every 50 rounds.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </DialogContent>
  );
}

function Ticker() {
  const [items, setItems] = useState<string[]>(() =>
    Array.from({ length: 10 }, () => makeEvent()),
  );
  useEffect(() => {
    const id = setInterval(() => {
      setItems((list) => [makeEvent(), ...list].slice(0, 24));
    }, 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative mb-3 overflow-hidden rounded-lg border border-white/10 bg-white/5">
      <div className="flex animate-[marquee_28s_linear_infinite] gap-8 whitespace-nowrap px-4 py-2 text-sm text-white/80">
        {items.map((item) => (
          <span
            key={`event-${item}`}
            className="inline-flex items-center gap-2"
          >
            <Trophy className="size-3.5 text-[#FFD12F]" />
            {item}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

function makeEvent() {
  const addr = `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`;
  const m = (
    Math.random() < 0.85 ? 1 + Math.random() * 3 : 5 + Math.random() * 50
  ).toFixed(2);
  const stake = [0.005, 0.01, 0.025, 0.05][Math.floor(Math.random() * 4)];
  return `${addr} cashed out ${m}x on ${stake} ETH`;
}

function Game() {
  const [stake, setStake] = useState(0.01);
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [mult, setMult] = useState(1);
  const [nearMiss, setNearMiss] = useState<string | null>(null);
  const [pnl, setPnl] = useState(0);
  const [plays, setPlays] = useState(0);
  const [showBreak, setShowBreak] = useState(false);
  const [auto, setAuto] = useState(false);
  const [lossLimit, setLossLimit] = useState(-0.25);

  const onCashOut = useCallback(() => {
    if (phase !== "spinning" && phase !== "won") return;
    const payout = stake * mult;
    setPnl((b) => Number((b - stake + payout).toFixed(6)));
    setPhase("won");
  }, [phase, stake, mult]);

  const onStart = useCallback(() => {
    if (plays >= 50 && !showBreak) {
      setShowBreak(true);
      return;
    }
    setNearMiss(null);
    setMult(1);
    setRound(1);
    setPhase("spinning");
    setPlays((n) => n + 1);
  }, [plays, showBreak]);

  const onNextRound = useCallback(
    (outcome: "success" | "bust" | "near") => {
      if (outcome === "success") {
        setRound((r) => r + 1);
        setMult((m) => Number((m * 1.0).toFixed(4))); // multiplier updated by canvas callback
      } else if (outcome === "bust") {
        setPhase("bust");
        setPnl((b) => Number((b - stake).toFixed(6)));
      } else {
        setNearMiss("So close to a Legendary lock!");
      }
    },
    [stake],
  );

  return (
    <section aria-label="Orbital Lock">
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm text-white/70">
            <span>Instant onchain loot. Built on Base.</span>
            <div className="flex items-center gap-3">
              <Badge label="House edge 3%" color="info" />
              <Badge label={`Round ${Math.max(round, 0)}`} color="neutral" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MultiplierReadout mult={mult} phase={phase} stake={stake} />
          <OrbitalLockCanvas
            phase={phase}
            setPhase={setPhase}
            round={round}
            setRound={setRound}
            mult={mult}
            setMult={setMult}
            onOutcome={onNextRound}
          />

          <div className="grid grid-cols-2 gap-2">
            {phase === "spinning" ? (
              <>
                <Button
                  className="h-12 w-full bg-[#0000FF] text-white hover:bg-[#0000E0]"
                  onClick={() =>
                    document.dispatchEvent(new CustomEvent("orbital-lock"))
                  }
                >
                  <Swords className="mr-2 size-4" />
                  Lock
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 w-full bg-white text-black hover:bg-white/90"
                  onClick={onCashOut}
                >
                  Cash out
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="h-12 w-full bg-[#0000FF] text-white hover:bg-[#0000E0]"
                  onClick={onStart}
                >
                  <Rocket className="mr-2 size-4" />
                  Start
                </Button>
                <Button
                  variant="outline"
                  className="h-12 w-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => {
                    setPhase("idle");
                    setMult(1);
                    setRound(0);
                    setNearMiss(null);
                  }}
                >
                  <RotateCw className="mr-2 size-4" />
                  Reset
                </Button>
              </>
            )}
          </div>

          <StakeControls stake={stake} onChange={setStake} />

          <Separator className="bg-white/10" />
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="text-white/70">
              Session P&amp;L:{" "}
              <span
                className={cn(
                  "font-semibold",
                  pnl >= 0 ? "text-[#66C800]" : "text-[#FC401F]",
                )}
              >
                {pnl >= 0 ? "+" : ""}
                {pnl.toFixed(4)} ETH
              </span>
            </div>
            <div className="flex items-center gap-4">
              <label
                htmlFor="auto-next-round"
                className="flex items-center gap-2 text-white/80"
              >
                <Switch checked={auto} onCheckedChange={setAuto} />
                Auto next round
              </label>
              <LossLimit value={lossLimit} onChange={setLossLimit} />
            </div>
          </div>

          {nearMiss && (
            <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200">
              {nearMiss}
            </div>
          )}
          {phase === "bust" && <LoseBar />}
          {phase === "won" && <WinBar payout={stake * mult} />}
          {showBreak && (
            <BreakNotice dismiss={() => setShowBreak(false)} plays={plays} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function MultiplierReadout({
  mult,
  phase,
  stake,
}: {
  mult: number;
  phase: Phase;
  stake: number;
}) {
  const color =
    phase === "bust"
      ? COLORS.red
      : mult > 1
        ? COLORS.green
        : phase === "spinning"
          ? COLORS.cerulean
          : "white";
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="text-5xl font-extrabold tracking-tight" style={{ color }}>
        {mult.toFixed(2)}x
      </div>
      {mult >= 10 && phase !== "bust" && (
        <span className="inline-flex items-center rounded-md bg-[#FFD12F]/15 px-2 py-1 text-sm font-semibold text-[#FFD12F]">
          <PartyPopper className="mr-1 size-4" />
          Legendary run
        </span>
      )}
      <div className="ml-auto text-right text-sm text-white/60">
        Stake
        <div className="font-semibold text-white">{stake} ETH</div>
      </div>
    </div>
  );
}

function StakeControls({
  stake,
  onChange,
}: {
  stake: number;
  onChange: (v: number) => void;
}) {
  const [val, setVal] = useState(stake);
  useEffect(() => setVal(stake), [stake]);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>Stake</span>
        <span>{stake} ETH</span>
      </div>
      <Slider
        value={[val]}
        onValueChange={(v) => setVal(v[0] ?? 0)}
        onValueCommit={(v) => onChange(Number((v[0] ?? 0.001).toFixed(3)))}
        min={0.001}
        max={0.2}
        step={0.001}
        className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white/30"
      />
      <div className="flex flex-wrap gap-2">
        {[0.005, 0.01, 0.025, 0.05, 0.1].map((p) => (
          <Button
            key={p}
            variant="outline"
            className={cn(
              "border-white/15 bg-white/5 text-white/80 hover:bg-white/10",
              stake === p && "border-[#0000FF] text-white",
            )}
            size="sm"
            onClick={() => onChange(p)}
          >
            {p} ETH
          </Button>
        ))}
      </div>
    </div>
  );
}

function LossLimit({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-white/60">Loss limit</span>
      <select
        className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-white/80"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {[-0.05, -0.1, -0.25, -0.5, -1].map((o) => (
          <option key={o} value={o}>
            {o} ETH
          </option>
        ))}
      </select>
    </label>
  );
}

function LoseBar() {
  return (
    <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
      Try again
    </div>
  );
}

function WinBar({ payout }: { payout: number }) {
  return (
    <div className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-200">
      Legendary drop! Payout: {payout.toFixed(6)} ETH
    </div>
  );
}

function BreakNotice({
  dismiss,
  plays,
}: {
  dismiss: () => void;
  plays: number;
}) {
  return (
    <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-100">
      <div className="font-semibold">Take a break</div>
      <p className="mt-1">
        You’ve played {plays} rounds. Consider a short pause.
      </p>
      <div className="mt-2">
        <Button
          size="sm"
          className="bg-white text-black hover:bg-white/90"
          onClick={dismiss}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: "info" | "neutral" }) {
  const styles =
    color === "info"
      ? "bg-[#3C8AFF]/20 text-[#a8c9ff]"
      : "bg-white/10 text-white/70";
  return (
    <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", styles)}>
      {label}
    </span>
  );
}

/**
 * OrbitalLockCanvas
 * - Large circular arena with rotating pointer and a shrinking/moving safe arc.
 * - Press "Lock" (or Space) to check if the pointer is inside the arc.
 * - On success: multiplier increases and arc shrinks; on miss: bust.
 */
function OrbitalLockCanvas({
  phase,
  setPhase,
  round,
  setRound,
  mult,
  setMult,
  onOutcome,
}: {
  phase: Phase;
  setPhase: (p: Phase) => void;
  round: number;
  setRound: (r: number) => void;
  mult: number;
  setMult: (m: number) => void;
  onOutcome: (o: "success" | "bust" | "near") => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reqRef = useRef<number | null>(null);
  const angleRef = useRef(0); // radians
  const speedRef = useRef(2.8); // rad/s
  const arcCenterRef = useRef(Math.PI / 2); // radians
  const arcSizeRef = useRef(Math.PI * 0.7); // radians (initial safe arc ~126deg)
  const lastTsRef = useRef<number | null>(null);

  // Initialize listeners for "Lock"
  useEffect(() => {
    const onLock = () => {
      if (phase !== "spinning") return;
      const ang = norm(angleRef.current);
      const c = norm(arcCenterRef.current);
      const half = arcSizeRef.current / 2;
      const diff = smallestDiff(ang, c);
      const inside = Math.abs(diff) <= half;
      const near = Math.abs(Math.abs(diff) - half) < (Math.PI / 180) * 4; // within 4deg is near-miss
      if (inside) {
        // Success: increase multiplier and shrink/move the arc, randomize speed
        const addFactor = growthForArc(arcSizeRef.current);
        const nextMult = Number((mult * addFactor).toFixed(4));
        setMult(nextMult);
        // visual difficulty increase
        arcSizeRef.current = Math.max(
          arcSizeRef.current * 0.8,
          (Math.PI / 180) * 12,
        ); // min 12deg
        arcCenterRef.current = Math.random() * Math.PI * 2;
        speedRef.current = 2.0 + Math.random() * 4.0;
        setRound(round + 1);
        onOutcome("success");
        // continue spinning
      } else {
        setPhase("bust");
        onOutcome(near ? "near" : "bust");
      }
    };
    document.addEventListener("orbital-lock", onLock);
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        onLock();
      }
      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        // Cash out handled in parent via button; we only support Lock here
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("orbital-lock", onLock);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, mult, round, setMult, setRound, onOutcome, setPhase]);

  // Start/stop animation loop when phase changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: yolo
  useEffect(() => {
    if (phase !== "spinning") {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      reqRef.current = null;
      lastTsRef.current = null;
      return;
    }
    const loop = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      angleRef.current += speedRef.current * dt;
      draw();
      reqRef.current = requestAnimationFrame(loop);
    };
    reqRef.current = requestAnimationFrame(loop);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      reqRef.current = null;
    };
  }, [phase]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: yolo
  useEffect(() => {
    draw();
  }, []);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const size = Math.min(rect.width, 420);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const R = size * 0.42;
    const cx = size / 2;
    const cy = size / 2;

    // Backdrop
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath();
    ctx.arc(cx, cy, R + 16, 0, Math.PI * 2);
    ctx.fill();

    // Safe arc
    const c = arcCenterRef.current;
    const half = arcSizeRef.current / 2;
    const start = c - half;
    const end = c + half;
    const grad = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
    grad.addColorStop(0, "rgba(0,0,255,0.3)");
    grad.addColorStop(1, "rgba(60,138,255,0.5)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, R, start, end, false);
    ctx.stroke();

    // Outer ring
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // Pointer
    const ang = angleRef.current;
    const px = cx + Math.cos(ang) * (R + 2);
    const py = cy + Math.sin(ang) * (R + 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Glow when pointer inside
    const inside = Math.abs(smallestDiff(norm(ang), norm(c))) <= half;
    if (inside) {
      ctx.shadowBlur = 24;
      ctx.shadowColor = COLORS.baseBlue;
      ctx.strokeStyle = COLORS.baseBlue;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Center text
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Press Lock in the blue window", cx, cy + R + 24);
  }

  // Update multiplier growth textually handled upstream; here we just compute and return via setMult on success
  // growthForArc returns multiplicative factor per success
  return (
    <div className="relative mx-auto mt-1 flex w-full flex-col items-center">
      <canvas
        ref={canvasRef}
        className="aspect-square w-full max-w-sm touch-manipulation rounded-xl"
      />
      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs text-white/60">
        <Kpi
          label="Arc"
          value={`${Math.round((arcSizeRef.current * 180) / Math.PI)}°`}
        />
        <Kpi label="Speed" value={`${speedRef.current.toFixed(1)} rad/s`} />
        <Kpi label="Round" value={round || "—"} />
      </div>
      {/* Auto-advance: when in spinning and user succeeds, parent keeps spinning.
          Cash out is in parent controls. */}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
      <div className="text-[10px] uppercase tracking-wide text-white/50">
        {label}
      </div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function growthForArc(arcRad: number) {
  // Map arc size to growth factor. Smaller arc => bigger factor.
  // 180deg => +20%, 90deg => +40%, 45deg => +75%, 20deg => +120%
  const deg = (arcRad * 180) / Math.PI;
  const add = 0.2 * (180 / Math.max(deg, 12)); // scale
  return 1 + Math.min(add, 1.2);
}

function norm(a: number) {
  const two = Math.PI * 2;
  return ((a % two) + two) % two;
}
function smallestDiff(a: number, b: number) {
  const two = Math.PI * 2;
  let d = a - b;
  d = ((d + Math.PI) % two) - Math.PI;
  return d;
}

function BottomDock() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/50 backdrop-blur">
      <div className="mx-auto flex max-w-screen-md items-center gap-2 px-3 py-2">
        <Button
          size="icon"
          variant="ghost"
          className="text-white/80 hover:text-white"
          title="Stats"
        >
          <Coins className="size-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-white/80 hover:text-white"
          title="Timer"
        >
          <Timer className="size-5" />
        </Button>
        <div className="ml-auto text-xs text-white/50">
          Always onchain. Built on Base.
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  Coins,
  Crown,
  DoorClosed,
  DoorOpen,
  Flame,
  HelpCircle,
  Shield,
  Skull,
  Swords,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

// Palette — Base
const COLORS = {
  baseBlue: "#0000FF",
  bg: "#0A0B0D",
  green: "#66C800",
  red: "#FC401F",
  yellow: "#FFD12F",
  cerulean: "#3C8AFF",
};

type Phase = "idle" | "choosing" | "bust" | "escaped" | "settled";

type RunRow = {
  trapIndex: number;
  choiceIndex?: number;
  survived?: boolean;
};

type RunState = {
  rows: RunRow[];
  level: number; // 1-based
  totalMultNoEdge: number;
  totalMultWithEdge: number;
};

type BubbleEvent = {
  id: string;
  name: string;
  color: string;
  win: boolean;
  amount: number; // ETH change (+ or -)
  multiplier?: number;
};

type LeaderRow = { name: string; pnl: number };

const HOUSE_EDGE = 0.95; // 5%

export default function Page() {
  return (
    <main className="min-h-dvh w-full" style={{ backgroundColor: COLORS.bg }}>
      <div className="mx-auto max-w-screen-lg px-3 pb-28 pt-3 sm:pt-6">
        <Header />
        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
          <DungeonGame />
          <RightRail />
        </div>
      </div>
      <BottomDock />
    </main>
  );
}

function Header() {
  const [muted, setMuted] = useState(true);
  return (
    <header className="mb-3 flex items-center justify-between">
      {/* Basemark as crest */}
      <div className="flex items-center gap-2">
        <div
          className="grid size-7 grid-cols-2 gap-0.5 rounded-sm"
          style={{ filter: `drop-shadow(0 0 16px ${COLORS.baseBlue})` }}
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
          How to Play — Dungeon Gauntlet
        </DialogTitle>
      </DialogHeader>

      <ol className="list-decimal space-y-2 pl-5 text-sm text-[#c0f28a]">
        <li>Place your stake (ETH), choose number of doors per level</li>
        <li>Each level has exactly one deadly trap behind a door</li>
        <li>
          Pick a door to advance; survive to increase your payout multiplier
        </li>
        <li>Cash out anytime to escape the dungeon with your loot</li>
        <li>If you hit the trap, you bust to 0</li>
      </ol>

      <Accordion type="single" collapsible className="mt-3">
        <AccordionItem value="math">
          <AccordionTrigger className="text-sm">
            Exact Multiplier Math
          </AccordionTrigger>
          <AccordionContent className="text-sm text-white/70">
            Base per level = 1 / (1 − death_probability). With N doors,
            death_probability = 1/N. Example (5 doors): Base = 1 / (1 − 0.2) =
            1.25x. Your total multiplier compounds each level. Cash-out applies
            a 5% house edge: Total × 0.95.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="fair">
          <AccordionTrigger className="text-sm">Provably Fair</AccordionTrigger>
          <AccordionContent className="text-sm text-white/70">
            This demo uses client simulation. On Base mainnet, trap locations
            per level will be derived from verifiable randomness. Settlements
            occur instantly onchain.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="responsible">
          <AccordionTrigger className="text-sm">
            Responsible Gaming
          </AccordionTrigger>
          <AccordionContent className="text-sm text-white/70">
            Max loss limits, break reminders, and self-exclusion options
            available. A reminder shows after 50 levels.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </DialogContent>
  );
}

/* =============================
   Game Logic
============================= */

function DungeonGame() {
  const [doors, setDoors] = useState(5); // number of choices per level
  const [stake, setStake] = useState(0.01);
  const [phase, setPhase] = useState<Phase>("idle");
  const [run, setRun] = useState<RunState>(() => newRun(doors));
  const [sessionPnL, setSessionPnL] = useState(0);
  const [_plays, setPlays] = useState(0);
  const [nearMiss, setNearMiss] = useState<string | null>(null);
  const [auto, setAuto] = useState(false);
  const [lossLimit, setLossLimit] = useState(-0.25);
  const [youName] = useState(() => youLabel());

  // Multiplier per row (no edge)
  const basePerRow = useMemo(() => baseForDoors(doors), [doors]);

  useEffect(() => {
    // any time doors change while idle, reset run
    if (phase === "idle") {
      setRun(newRun(doors));
    }
  }, [doors, phase]);

  // Autoplay: after a success, if auto is ON, auto-pick a random door next level
  // biome-ignore lint/correctness/useExhaustiveDependencies: yolo
  useEffect(() => {
    if (!auto) return;
    if (phase !== "choosing") return;
    const id = setTimeout(() => {
      chooseDoor(Math.floor(Math.random() * doors));
    }, 900); // quick pace
    return () => clearTimeout(id);
  }, [phase, auto, doors]);

  function start() {
    setNearMiss(null);
    setPhase("choosing");
    setRun(newRun(doors));
    setPlays((n) => n + 1);
  }

  function chooseDoor(index: number) {
    if (phase !== "choosing") return;
    setRun((state) => {
      const lvl = state.level;
      const row = state.rows[lvl - 1];
      if (!row) return state;
      row.choiceIndex = index;
      const hitTrap = row.trapIndex === index;
      row.survived = !hitTrap;
      const totalNoEdge = hitTrap
        ? 0
        : Number((state.totalMultNoEdge * baseForDoors(doors)).toFixed(6));
      const totalWithEdge = hitTrap
        ? 0
        : Number((totalNoEdge * HOUSE_EDGE).toFixed(6));
      const next: RunState = {
        rows: [...state.rows],
        level: hitTrap ? lvl : lvl + 1,
        totalMultNoEdge: totalNoEdge,
        totalMultWithEdge: totalWithEdge,
      };
      if (hitTrap) {
        setPhase("bust");
        setSessionPnL((b) => Number((b - stake).toFixed(6)));
        pushBubble({
          name: youName,
          win: false,
          amount: -stake,
        });
      } else {
        // near-miss hint
        if (Math.abs(row.trapIndex - index) === 1) {
          setNearMiss("You feel a gust... a trap was close by.");
        } else {
          setNearMiss(null);
        }
      }
      return next;
    });
  }

  function cashOut() {
    if (phase !== "choosing") return;
    const payout = Number((stake * run.totalMultWithEdge).toFixed(6));
    const delta = payout - stake;
    setSessionPnL((b) => Number((b + delta).toFixed(6)));
    setPhase("escaped");
    pushBubble({
      name: youName,
      win: payout > 0,
      amount: delta,
      multiplier: run.totalMultWithEdge,
    });
    setTimeout(() => setPhase("settled"), 1000);
  }

  // Stop autoplay if loss limit breached
  useEffect(() => {
    if (auto && sessionPnL <= lossLimit) setAuto(false);
  }, [auto, sessionPnL, lossLimit]);

  return (
    <section aria-label="Dungeon">
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm text-white/70">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-white/60" />
              Adventurer
            </div>
            <div className="flex items-center gap-3">
              <Badge label={`Level ${Math.max(run.level, 1)}`} />
              <Badge label={`${doors} doors`} />
              <Badge
                label={`Row base ${basePerRow.toFixed(2)}x`}
                variant="info"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TopReadout
            stake={stake}
            multNoEdge={run.totalMultNoEdge}
            multWithEdge={run.totalMultWithEdge}
            phase={phase}
          />

          <DungeonBoard
            doors={doors}
            run={run}
            phase={phase}
            onPick={chooseDoor}
          />

          <div className="grid grid-cols-2 gap-2">
            {phase === "choosing" ? (
              <>
                <Button
                  className="h-12 w-full bg-[#0000FF] text-white hover:bg-[#0000E0]"
                  onClick={cashOut}
                >
                  <Coins className="mr-2 size-4" />
                  Loot & Leave
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 w-full bg-white text-black hover:bg-white/90"
                  onClick={() => start()}
                >
                  Restart
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="h-12 w-full bg-[#0000FF] text-white hover:bg-[#0000E0]"
                  onClick={start}
                >
                  <Swords className="mr-2 size-4" />
                  Enter Dungeon
                </Button>
                <Button
                  variant="outline"
                  className="h-12 w-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => {
                    setRun(newRun(doors));
                    setPhase("idle");
                    setNearMiss(null);
                  }}
                >
                  Reset
                </Button>
              </>
            )}
          </div>

          <StakeControls
            stake={stake}
            setStake={setStake}
            doors={doors}
            setDoors={setDoors}
          />

          <Separator className="bg-white/10" />

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="text-white/70">
              Session P&amp;L:{" "}
              <span
                className={cn(
                  "font-semibold",
                  sessionPnL >= 0 ? "text-[#66C800]" : "text-[#FC401F]",
                )}
              >
                {sessionPnL >= 0 ? "+" : ""}
                {sessionPnL.toFixed(4)} ETH
              </span>
            </div>
            <div className="flex items-center gap-4">
              <label
                className="flex items-center gap-2 text-white/80"
                htmlFor="auto-sell"
              >
                <Switch checked={auto} onCheckedChange={setAuto} />
                Auto-advance
              </label>
              <LossLimitSelector value={lossLimit} onChange={setLossLimit} />
            </div>
          </div>

          {nearMiss && (
            <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200">
              {nearMiss}
            </div>
          )}

          {phase === "bust" && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              Try again
            </div>
          )}
          {phase === "escaped" && (
            <div className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-200">
              You escaped with loot!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating live bubbles for all players */}
      <LiveBubbleOverlay />
    </section>
  );
}

/* =============================
   Dungeon UI
============================= */

function DungeonBoard({
  doors,
  run,
  phase,
  onPick,
}: {
  doors: number;
  run: RunState;
  phase: Phase;
  onPick: (i: number) => void;
}) {
  const level = run.level;
  const row = run.rows[level - 1]; // current level row
  const reveal = phase === "bust" || phase === "escaped" || phase === "settled";

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="relative rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-4">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-white/60">Choose a door to proceed</span>
          <span className="text-white/40">Trap resets every level</span>
        </div>
        <div className="grid grid-cols-5 gap-3 sm:grid-cols-5">
          {Array.from({ length: doors }).map((_, i) => {
            const isChoice = row?.choiceIndex === i;
            const isTrap = row?.trapIndex === i;
            const busted = isChoice && isTrap;
            const survived = isChoice && row?.survived;

            return (
              <button
                type="button"
                key={`door-${i}-${Math.random()}`}
                disabled={phase !== "choosing"}
                onClick={() => onPick(i)}
                className={cn(
                  "flex aspect-[3/5] items-end justify-center rounded-lg border transition-all",
                  "bg-[linear-gradient(180deg,rgba(0,0,0,0.4),rgba(0,0,0,0.2))] shadow-inner",
                  "hover:translate-y-[-2px] hover:shadow-[0_0_0_2px_rgba(255,255,255,0.1)_inset]",
                  phase === "choosing" ? "cursor-pointer" : "cursor-default",
                  isChoice && "outline outline-2 outline-[#3C8AFF]/60",
                  reveal &&
                    isTrap &&
                    "animate-[pulse_1.2s_ease-in-out_infinite] border-[#FC401F] bg-[#FC401F]/10",
                  reveal && !isTrap && "border-white/15",
                  !reveal && "border-white/10",
                )}
                aria-label={`Door ${i + 1}`}
              >
                <div className="mb-3 flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-xs text-white/70">
                  {isChoice ? (
                    <DoorOpen className="size-3.5" />
                  ) : (
                    <DoorClosed className="size-3.5" />
                  )}
                  <span>Door {i + 1}</span>
                </div>

                {busted && (
                  <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-red-400">
                    <Skull className="mx-auto size-10" />
                  </span>
                )}
                {survived && (
                  <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[#66C800]">
                    <Flame className="mx-auto size-10" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(252, 64, 31, 0.4);
          }
          70% {
            box-shadow: 0 0 0 12px rgba(252, 64, 31, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(252, 64, 31, 0);
          }
        }
      `}</style>
    </div>
  );
}

function TopReadout({
  stake,
  multNoEdge,
  multWithEdge,
  phase,
}: {
  stake: number;
  multNoEdge: number;
  multWithEdge: number;
  phase: Phase;
}) {
  const color =
    phase === "bust"
      ? COLORS.red
      : multWithEdge >= 1
        ? COLORS.green
        : phase === "choosing"
          ? COLORS.cerulean
          : "white";
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="text-5xl font-extrabold tracking-tight" style={{ color }}>
        {multWithEdge.toFixed(2)}x
      </div>
      <div className="text-right">
        <div className="text-sm text-white/60">Stake</div>
        <div className="text-xl font-semibold text-white">{stake} ETH</div>
        <div className="text-xs text-white/40">
          Pre-edge: {multNoEdge.toFixed(2)}x
        </div>
      </div>
    </div>
  );
}

function StakeControls({
  stake,
  setStake,
  doors,
  setDoors,
}: {
  stake: number;
  setStake: (n: number) => void;
  doors: number;
  setDoors: (n: number) => void;
}) {
  const [sv, setSv] = useState(stake);
  useEffect(() => setSv(stake), [stake]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>Stake</span>
          <span>{stake} ETH</span>
        </div>
        <Slider
          value={[sv]}
          onValueChange={(v) => setSv(v[0] ?? 0)}
          onValueCommit={(v) =>
            setStake(Math.max(0.001, Number((v[0] ?? 0.001).toFixed(3))))
          }
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
              size="sm"
              className={cn(
                "border-white/15 bg-white/5 text-white/80 hover:bg-white/10",
                stake === p && "border-[#0000FF] text-white",
              )}
              onClick={() => setStake(p)}
            >
              {p} ETH
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>Doors per level</span>
          <span>{doors}</span>
        </div>
        <Slider
          value={[doors]}
          onValueChange={(v) => setDoors(clamp(Math.round(v[0] ?? 5), 3, 10))}
          min={3}
          max={10}
          step={1}
          className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white/30"
        />
        <p className="text-xs text-white/50">
          Death chance per level: {(100 / doors).toFixed(1)}% • Row base:{" "}
          {baseForDoors(doors).toFixed(2)}x
        </p>
      </div>
    </div>
  );
}

function LossLimitSelector({
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

function Badge({
  label,
  variant = "neutral",
}: {
  label: string;
  variant?: "neutral" | "info";
}) {
  const cls =
    variant === "info"
      ? "bg-[#3C8AFF]/20 text-[#a8c9ff]"
      : "bg-white/10 text-white/70";
  return (
    <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", cls)}>
      {label}
    </span>
  );
}

/* =============================
   Math + Run helpers
============================= */

function baseForDoors(n: number) {
  // Death probability = 1/n
  // Row base = 1 / (1 - 1/n)
  return 1 / (1 - 1 / n);
}

function newRun(doors: number): RunState {
  const rows: RunRow[] = [];
  // Pre-generate many rows (like a deep dungeon), random trap each row
  const depth = 18;
  for (let i = 0; i < depth; i++) {
    rows.push({ trapIndex: Math.floor(Math.random() * doors) });
  }
  return {
    rows,
    level: 1,
    totalMultNoEdge: 1,
    totalMultWithEdge: 1,
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/* =============================
   Right Rail: Leaderboard + Live Ticker
============================= */

function RightRail() {
  return (
    <div className="space-y-4">
      <DailyLeaderboard />
      <LiveTickerPanel />
    </div>
  );
}

function youLabel() {
  const hex = Math.random().toString(16).slice(2, 6);
  return `you_${hex}`;
}

// Simple shared event bus for bubbles/leaderboard
const subs: ((e: BubbleEvent) => void)[] = [];
function subscribe(fn: (e: BubbleEvent) => void) {
  subs.push(fn);
  return () => {
    const i = subs.indexOf(fn);
    if (i >= 0) subs.splice(i, 1);
  };
}
function pushBubble(e: {
  name: string;
  win: boolean;
  amount: number;
  multiplier?: number;
}) {
  const evt: BubbleEvent = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
    color: randColor(),
    ...e,
  };
  subs.forEach((fn) => fn(evt));
}

function DailyLeaderboard() {
  const [rows, setRows] = useState<LeaderRow[]>(() => seedLeaders());
  const total = rows.reduce((a, b) => a + Math.max(0, b.pnl), 0);

  // integrate incoming bubble events into leaderboard
  useEffect(() => {
    return subscribe((e) => {
      setRows((prev) => {
        const idx = prev.findIndex((r) => r.name === e.name);
        const delta = e.amount;
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = {
            ...prev[idx],
            pnl: Number((prev[idx].pnl + delta).toFixed(6)),
          };
          return order(next);
        } else {
          return order([
            ...prev,
            { name: e.name, pnl: Number(delta.toFixed(6)) },
          ]);
        }
      });
    });
  }, []);

  // simulate other players frequently
  useEffect(() => {
    const id = setInterval(() => {
      const e = randomPlayerEvent();
      pushBubble(e);
    }, 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm text-white/70">
          <span className="flex items-center gap-2">
            <Crown className="size-4 text-[#FFD12F]" />
            Daily Leaderboard
          </span>
          <span className="text-[11px] text-white/40">Top earnings (ETH)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {rows.slice(0, 10).map((r, i) => (
          <div
            key={r.name}
            className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 text-right text-xs text-white/40">
                {i + 1}
              </span>
              <span className="text-sm text-white/80">{r.name}</span>
            </div>
            <div
              className={cn(
                "text-sm font-semibold",
                r.pnl >= 0 ? "text-[#66C800]" : "text-[#FC401F]",
              )}
            >
              {r.pnl >= 0 ? "+" : ""}
              {r.pnl.toFixed(4)}
            </div>
          </div>
        ))}
        <div className="mt-2 text-right text-xs text-white/50">
          Total payouts today: {total.toFixed(3)} ETH
        </div>
      </CardContent>
    </Card>
  );
}

function order(rows: LeaderRow[]) {
  return rows.sort((a, b) => b.pnl - a.pnl);
}
function seedLeaders(): LeaderRow[] {
  const names = [
    "gryphon",
    "dusk",
    "ember",
    "runic",
    "shade",
    "ivy",
    "bramble",
    "hollow",
    "quill",
    "sable",
  ];
  return order(
    names.map((n) => ({ name: n, pnl: (Math.random() - 0.3) * 1.2 })),
  );
}
function randomPlayerEvent() {
  const win = Math.random() < 0.46; // modestly < 50% win rate to simulate edge
  const amount = Number(
    (
      (win ? 0.01 + Math.random() * 0.06 : -0.005 - Math.random() * 0.06) *
      (Math.random() < 0.2 ? 2 : 1)
    ).toFixed(4),
  );
  const m = win ? 1 + Math.random() * 5 : undefined;
  const name = randomName();
  return { name, win, amount, multiplier: m };
}
function randomName() {
  const syll = [
    "ash",
    "bane",
    "cy",
    "dra",
    "eld",
    "fyr",
    "grim",
    "hex",
    "ion",
    "jyn",
    "kor",
    "lyr",
    "morn",
    "nyx",
    "orn",
    "pyre",
    "quin",
    "rukh",
    "sy",
    "tha",
    "umb",
    "vyr",
    "wyr",
    "xen",
    "yul",
    "zeth",
  ];
  const s1 = syll[Math.floor(Math.random() * syll.length)];
  const s2 = syll[Math.floor(Math.random() * syll.length)];
  return s1 + s2;
}
function randColor() {
  const pool = [
    COLORS.green,
    COLORS.red,
    COLORS.baseBlue,
    COLORS.cerulean,
    "#7C3AED",
    COLORS.yellow,
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

function LiveTickerPanel() {
  const [events, setEvents] = useState<BubbleEvent[]>([]);
  useEffect(() => {
    return subscribe((e) => {
      setEvents((prev) => [e, ...prev].slice(0, 12));
    });
  }, []);
  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-white/70">Live Runs</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {events.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <span
                className="relative inline-flex size-6 items-center justify-center rounded-full"
                style={{ backgroundColor: e.color }}
              >
                <Skull className="size-3 text-black/80" />
              </span>
              <span className="text-sm text-white/80">{e.name}</span>
            </div>
            <div
              className={cn(
                "text-sm font-semibold",
                e.win ? "text-[#66C800]" : "text-[#FC401F]",
              )}
            >
              {e.win ? "+" : ""}
              {Math.abs(e.amount).toFixed(3)} ETH
              {e.multiplier ? ` ×${e.multiplier.toFixed(2)}` : ""}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* Floating bubble overlay */
function LiveBubbleOverlay() {
  const [bubbles, setBubbles] = useState<BubbleEvent[]>([]);
  useEffect(() => {
    return subscribe((e) => {
      setBubbles((prev) => [e, ...prev].slice(0, 20));
      // auto remove after a few seconds
      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== e.id));
      }, 3500);
    });
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {bubbles.map((b, i) => {
        const left = (i * 13) % 85;
        return (
          <div
            key={b.id}
            className={cn(
              "absolute rounded-full px-3 py-2 text-xs font-semibold text-white shadow-lg",
              b.win ? "bg-[#66C800]/80" : "bg-[#FC401F]/80",
            )}
            style={{
              left: `${left + Math.random() * 5}%`,
              bottom: `${10 + (i % 5) * 12}%`,
              transform: "translateY(0)",
              animation: "rise 3.2s ease-out forwards",
            }}
          >
            <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-black/20">
              <Skull className="size-3" />
            </span>
            {b.win ? "+" : "-"}
            {Math.abs(b.amount).toFixed(3)} ETH
            {b.multiplier ? ` ×${b.multiplier.toFixed(2)}` : ""}
          </div>
        );
      })}
      <style jsx>{`
        @keyframes rise {
          from {
            opacity: 0.9;
            transform: translateY(10px);
          }
          to {
            opacity: 0;
            transform: translateY(-80px);
          }
        }
      `}</style>
    </div>
  );
}

/* =============================
   Bottom dock
============================= */

function BottomDock() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/50 backdrop-blur">
      <div className="mx-auto flex max-w-screen-lg items-center gap-2 px-3 py-2">
        <Button
          size="icon"
          variant="ghost"
          className="text-white/80 hover:text-white"
          title="Inventory"
        >
          <Shield className="size-5" />
        </Button>
        <div className="text-xs text-white/60">
          Instant onchain loot. Built on Base.
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="rounded-md bg-[#0000FF]/20 px-2 py-1 text-[#a3b0ff]">
            House edge 5%
          </span>
        </div>
      </div>
    </div>
  );
}

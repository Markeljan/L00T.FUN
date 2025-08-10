"use client";

import {
  Coins,
  Flame,
  PartyPopper,
  Play,
  Repeat2,
  Settings,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import WalletConnect from "@/components/WalletConnect";
import { cn } from "@/lib/utils";

type Result = {
  multiplier: number;
  rarity: Rarity;
  win: boolean;
  payout: number;
  legendary: boolean;
};

type Rarity = "bust" | "common" | "rare" | "epic" | "legendary";

const COLORS = {
  baseBlue: "#0000FF",
  bg: "#0A0B0D",
  green: "#66C800",
  red: "#FC401F",
  yellow: "#FFD12F",
  cerulean: "#3C8AFF",
  graySlot: "#1A232E",
};

const PRESETS = [0.005, 0.01, 0.025, 0.05, 0.1]; // ETH presets

export default function Page() {
  return (
    <main className="min-h-dvh w-full" style={{ backgroundColor: COLORS.bg }}>
      <div className="mx-auto max-w-screen-md px-3 pb-28 pt-3 sm:pt-6">
        <Header />
        <GameShell />
      </div>
      <BottomControlsDock />
    </main>
  );
}

function Header() {
  return (
    <header className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          aria-hidden
          className="size-7 rounded-sm"
          style={{
            backgroundColor: COLORS.baseBlue,
            boxShadow: `0 0 16px ${COLORS.baseBlue}`,
          }}
        />
        <span className="text-lg font-semibold tracking-wide text-white/90">
          L00T.fun
        </span>
      </div>
      <div className="flex items-center gap-2">
        <WalletConnect className="z-10" />
        <Button
          size="icon"
          variant="outline"
          className="border-white/10 text-white/80 bg-white/5 hover:bg-white/10"
        >
          <Settings className="size-4" />
        </Button>
      </div>
    </header>
  );
}

function GameShell() {
  const [muted, setMuted] = useState(true);
  return (
    <div className="grid gap-4">
      <Ticker />
      <div className="grid gap-4 sm:grid-cols-[1fr]">
        <LootGame muted={muted} onMuteToggle={() => setMuted((m) => !m)} />
        <StatsPanels />
      </div>
    </div>
  );
}

function Ticker() {
  // Simulated "Last Big Wins"
  const [events, setEvents] = useState<string[]>(() => seedEvents());
  useEffect(() => {
    const id = setInterval(() => {
      setEvents((prev) => {
        const next = [...prev];
        next.unshift(genEvent());
        return next.slice(0, 24);
      });
    }, 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/5 bg-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[marquee_24s_linear_infinite]" />
      <div className="flex gap-6 whitespace-nowrap px-4 py-2 text-sm text-white/80">
        {events.map((event) => (
          <span
            key={`event-${event}`}
            className="inline-flex items-center gap-2"
          >
            <Trophy className="size-3.5 text-[#FFD12F]" />
            {event}
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

function seedEvents() {
  return Array.from({ length: 12 }).map(() => genEvent());
}
function genEvent() {
  const m = weightedMultiplier();
  const addr = `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`;
  const stake = [0.005, 0.01, 0.025, 0.05][Math.floor(Math.random() * 4)];
  return `${addr} hit ${m.toFixed(1)}x on ${stake} ETH`;
}

function LootGame({
  muted,
  onMuteToggle,
}: {
  muted: boolean;
  onMuteToggle: () => void;
}) {
  const [stake, setStake] = useState(0.01);
  const [lastStake, setLastStake] = useState(0.01);
  const [charging, setCharging] = useState(false);
  const [percent, setPercent] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [balance, setBalance] = useState(0); // session P&L in ETH
  const [plays, setPlays] = useState(0);
  const [wins, setWins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestWin, setBestWin] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [lossLimit, setLossLimit] = useState(-0.25); // -0.25 ETH default
  const [hotBonus, setHotBonus] = useState(0); // extra multiplier %
  const [showBreak, setShowBreak] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const comboBonusPct = Math.min(streak * 0.01, 0.1) + hotBonus; // up to +10% + hot bonus

  // Keyboard: Space play, R repeat
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        play();
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        repeat();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: mvp
  useEffect(() => {
    if (autoPlay) {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      autoplayRef.current = setInterval(() => {
        play();
      }, 3500);
    } else {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    }
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [autoPlay, stake]); // rebind when stake changes

  function classify(multiplier: number): Rarity {
    if (multiplier < 1) return "bust";
    if (multiplier < 2) return "common";
    if (multiplier < 5) return "rare";
    if (multiplier < 20) return "epic";
    return "legendary";
  }

  function play() {
    if (charging) return;
    // Responsible play
    if (plays >= 50 && !showBreak) {
      setShowBreak(true);
      return;
    }
    // Start charge-up
    setCharging(true);
    setResult(null);
    setPercent(0);
    setLastStake(stake);
    let p = 0;
    const start = Date.now();
    const dur = 3000;
    const id = setInterval(() => {
      const t = Date.now() - start;
      p = Math.min(100, Math.round((t / dur) * 100));
      setPercent(p);
      if (p >= 100) {
        clearInterval(id);
        reveal();
      }
    }, 30);
  }

  function reveal() {
    // Weighted random with house edge
    let m = weightedMultiplier();
    // Apply combo bonus
    if (m >= 1) {
      m = m * (1 + comboBonusPct);
    }
    const r: Result = {
      multiplier: m,
      rarity: classify(m),
      win: m >= 1,
      payout: Number((lastStake * m).toFixed(6)),
      legendary: m >= 20,
    };
    setResult(r);
    setPlays((n) => n + 1);
    if (r.win) {
      setWins((w) => w + 1);
      setStreak((s) => s + 1);
      if (r.multiplier > bestWin) setBestWin(r.multiplier);
      setBalance((b) => Number((b - lastStake + r.payout).toFixed(6)));
      haptics(r.multiplier >= 10 ? "big" : "small");
    } else {
      setStreak(0);
      setBalance((b) => Number((b - lastStake + r.payout).toFixed(6))); // payout < stake
      haptics("tiny");
    }
    setCharging(false);

    // Autoplay: stop if loss limit breached or Legendary hit
    if (autoPlay) {
      const breached = balance + (-lastStake + r.payout) <= lossLimit;
      if (breached || r.legendary) setAutoPlay(false);
    }
  }

  function repeat() {
    play();
  }

  const winRate = plays ? Math.round((wins / plays) * 100) : 0;

  // Hot streak bonus pulses randomly (variable ratio reinforcement)
  useEffect(() => {
    const id = setInterval(() => {
      setHotBonus(Math.random() < 0.2 ? 0.03 : 0); // 3% bonus sometimes
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <section aria-label="Main game">
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-white/80">
              Instant onchain loot. Built on Base.
            </CardTitle>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold",
                  hotBonus
                    ? "bg-[#0000FF]/20 text-[#93a2ff]"
                    : "bg-white/10 text-white/70",
                )}
                title="Random bonus may apply"
              >
                <Flame className="mr-1 size-3.5" />
                Hot Bonus {hotBonus ? "+3%" : "OFF"}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={onMuteToggle}
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? (
                  <VolumeX className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <MultiplierDisplay
            result={result}
            charging={charging}
            percent={percent}
          />
          <ChargeBar percent={percent} charging={charging} />
          <LootChest
            charging={charging}
            rarity={result?.rarity}
            big={result?.multiplier ?? 0}
          />
          <StakeControls
            stake={stake}
            setStake={setStake}
            onPlay={play}
            onRepeat={repeat}
            charging={charging}
          />
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-white/70">
            <Stat label="Plays" value={plays} />
            <Stat label="Win rate" value={`${winRate}%`} />
            <Stat label="Biggest win" value={`${bestWin.toFixed(1)}x`} />
          </div>

          <Separator className="bg-white/10" />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <span className="text-white/70">Session P&amp;L:</span>{" "}
              <span
                className={cn(
                  "font-semibold",
                  balance >= 0 ? "text-[#66C800]" : "text-[#FC401F]",
                )}
              >
                {balance >= 0 ? "+" : ""}
                {balance.toFixed(4)} ETH
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={autoPlay}
                  onCheckedChange={setAutoPlay}
                  id="autoplay"
                />
                <label htmlFor="autoplay" className="text-sm text-white/80">
                  Auto-play
                </label>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span>Loss limit</span>
                <LossLimitSelector value={lossLimit} onChange={setLossLimit} />
              </div>
            </div>
          </div>

          {showBreak && (
            <TakeABreak
              onContinue={() => setShowBreak(false)}
              onDisable={() => setShowBreak(false)}
              plays={plays}
            />
          )}

          {/* Hints */}
          <p className="mt-1 text-[11px] text-white/40">
            Keyboard: SPACE to play, R to repeat • House edge 3% • Provably fair
            coming soon on Base
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 py-2">
      <div className="text-[10px] uppercase tracking-wide text-white/50">
        {label}
      </div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function ChargeBar({
  percent,
  charging,
}: {
  percent: number;
  charging: boolean;
}) {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className={cn("absolute left-0 top-0 h-full rounded-full")}
        style={{
          width: `${percent}%`,
          background: `linear-gradient(90deg, ${COLORS.baseBlue}, ${COLORS.cerulean})`,
          boxShadow: charging ? `0 0 16px ${COLORS.baseBlue}` : undefined,
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
}

function MultiplierDisplay({
  result,
  charging,
  percent,
}: {
  result: Result | null;
  charging: boolean;
  percent: number;
}) {
  const txt = charging
    ? `${Math.min(99, percent)}%`
    : result
      ? `${result.multiplier.toFixed(2)}x`
      : "Ready";
  const color = charging
    ? "text-[#3C8AFF]"
    : result
      ? result.win
        ? "text-[#66C800]"
        : "text-[#FC401F]"
      : "text-white/70";
  return (
    <div
      className={cn(
        "flex items-center justify-center text-5xl font-extrabold tracking-tight",
        color,
      )}
    >
      <span>{txt}</span>
      {result?.legendary && !charging && <LegendaryBurst />}
    </div>
  );
}

function LootChest({
  charging,
  rarity,
  big,
}: {
  charging: boolean;
  rarity?: Rarity;
  big: number;
}) {
  const shake = big >= 10 && !charging;
  const glow = charging ? COLORS.baseBlue : rarityGlow(rarity);

  return (
    <div className="relative mx-auto mt-1 aspect-[3/2] w-full max-w-xs">
      {/* Chest body */}
      <div
        role="img"
        className={cn(
          "absolute inset-0 rounded-xl border",
          "bg-gradient-to-b from-[#1b1f2a] to-[#0f141c] border-white/10",
          shake && "animate-[shake_0.4s_ease-in-out_2]",
        )}
        style={{ boxShadow: glow ? `0 0 32px ${glow}` : undefined }}
        aria-label="Loot chest"
      />
      {/* Lid */}
      <div
        className={cn(
          "absolute left-1/2 top-0 h-4 w-[86%] -translate-x-1/2 rounded-t-xl",
          "bg-gradient-to-b from-white/10 to-white/0",
        )}
      />
      {/* Basemark loader when charging */}
      {charging && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Basemark />
        </div>
      )}
      <style jsx>{`
        @keyframes shake {
          0% {
            transform: translate(0);
          }
          25% {
            transform: translate(-2px, 1px) rotate(-0.5deg);
          }
          50% {
            transform: translate(2px, -1px) rotate(0.5deg);
          }
          75% {
            transform: translate(-1px, 2px) rotate(-0.5deg);
          }
          100% {
            transform: translate(0);
          }
        }
      `}</style>
      {/* Confetti on wins */}
      {!charging && big >= 1 && <WinParticles big={big >= 20} />}
    </div>
  );
}

function Basemark() {
  return (
    <div className="grid grid-cols-2 gap-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="size-3 animate-pulse rounded-sm"
          style={{
            backgroundColor: COLORS.baseBlue,
            animationDelay: `${i * 80}ms`,
            boxShadow: `0 0 10px ${COLORS.baseBlue}`,
          }}
        />
      ))}
    </div>
  );
}

function rarityGlow(r?: Rarity) {
  if (!r) return "";
  switch (r) {
    case "bust":
      return "#00000000";
    case "common":
      return "#64748b55"; // gray
    case "rare":
      return "#0000FF66";
    case "epic":
      return "#7C3AED66"; // purple
    case "legendary":
      return "#FFD12F88";
  }
}

function StakeControls({
  stake,
  setStake,
  onPlay,
  onRepeat,
  charging,
}: {
  stake: number;
  setStake: (n: number) => void;
  onPlay: () => void;
  onRepeat: () => void;
  charging: boolean;
}) {
  const [slider, setSlider] = useState(stake);
  useEffect(() => setSlider(stake), [stake]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>Stake</span>
        <span>{stake} ETH</span>
      </div>
      <Slider
        value={[slider]}
        onValueChange={(v) => setSlider(v[0] ?? 0)}
        onValueCommit={(v) =>
          setStake(Math.max(0.001, Number((v[0] ?? 0.001).toFixed(3))))
        }
        min={0.001}
        max={0.2}
        step={0.001}
        className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white/30"
      />
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p}
            variant="outline"
            size="sm"
            className={cn(
              "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
              stake === p && "border-[#0000FF] text-white",
            )}
            onClick={() => setStake(p)}
          >
            {p} ETH
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          className="h-12 w-full bg-[#0000FF] text-white hover:bg-[#0000E0]"
          onClick={onPlay}
          disabled={charging}
        >
          <Zap className="mr-2 size-4" />
          Open Loot
        </Button>
        <Button
          variant="secondary"
          className="h-12 w-full bg-white text-black hover:bg-white/90"
          onClick={onRepeat}
          disabled={charging}
        >
          <Repeat2 className="mr-2 size-4" />
          Repeat
        </Button>
      </div>
      <p className="text-center text-xs text-white/50">
        Swipe up/down to adjust stake on mobile
      </p>
    </div>
  );
}

function WinParticles({ big }: { big: boolean }) {
  // simple DOM particles
  const items = useMemo(() => Array.from({ length: big ? 70 : 35 }), [big]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map(() => (
        <span
          key={`particle-${Math.random()}`}
          className="absolute block size-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 30 + 35}%`,
            backgroundColor: big ? COLORS.yellow : COLORS.green,
            filter: `drop-shadow(0 0 6px ${big ? COLORS.yellow : COLORS.green})`,
            transform: `translate(-50%, -50%)`,
            animation: `rise ${1 + Math.random() * 1.2}s ease-out ${Math.random() * 0.6}s both`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes rise {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -140%) scale(0.8);
          }
        }
      `}</style>
    </div>
  );
}

function LegendaryBurst() {
  return (
    <span className="ml-2 inline-flex items-center rounded-md bg-[#FFD12F]/15 px-2 py-1 text-base font-semibold text-[#FFD12F]">
      <PartyPopper className="mr-1 size-4" />
      Legendary drop!
    </span>
  );
}

function LossLimitSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const options = [-0.05, -0.1, -0.25, -0.5, -1];
  return (
    <div className="flex items-center gap-1">
      <select
        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-white/80"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o} ETH
          </option>
        ))}
      </select>
    </div>
  );
}

function TakeABreak({
  onContinue,
  onDisable,
  plays,
}: {
  onContinue: () => void;
  onDisable: () => void;
  plays: number;
}) {
  return (
    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
      <div className="font-semibold">Take a break</div>
      <p className="mt-1">
        You’ve played {plays} times in this session. Consider a short break. You
        can continue or come back later.
      </p>
      <div className="mt-2 flex gap-2">
        <Button
          size="sm"
          className="bg-white text-black hover:bg-white/90"
          onClick={onContinue}
        >
          Continue
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-white/20 text-white/80 bg-transparent"
          onClick={onDisable}
        >
          Thanks, dismiss
        </Button>
      </div>
    </div>
  );
}

function StatsPanels() {
  const [global, setGlobal] = useState({
    volume: 1243.23,
    players: 324,
    biggest: 58.2,
  });
  // Light live-updates
  useEffect(() => {
    const id = setInterval(() => {
      setGlobal((g) => ({
        volume: Number((g.volume + Math.random() * 5).toFixed(2)),
        players: g.players + (Math.random() < 0.5 ? 0 : 1),
        biggest: Math.max(
          g.biggest,
          Math.random() < 0.1
            ? Number((20 + Math.random() * 80).toFixed(1))
            : g.biggest,
        ),
      }));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white/70">Your Session</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          <MiniKpi label="P&amp;L" value="+0.0000 ETH" positive />
          <MiniKpi label="Win rate" value="—" />
          <MiniKpi label="Biggest win" value="—" />
        </CardContent>
      </Card>
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white/70">Global</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          <MiniKpi
            label="Total Volume"
            value={`${global.volume.toFixed(2)} ETH`}
            info
          />
          <MiniKpi label="Active Players" value={global.players} info />
          <MiniKpi
            label="Biggest Today"
            value={`${global.biggest.toFixed(1)}x`}
            positive
          />
        </CardContent>
      </Card>
      <Leaderboard />
    </div>
  );
}

function MiniKpi({
  label,
  value,
  positive,
  info,
}: {
  label: string;
  value: string | number;
  positive?: boolean;
  info?: boolean;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      <div className="text-[10px] uppercase tracking-wide text-white/50">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-sm font-semibold",
          positive && "text-[#66C800]",
          info && "text-[#3C8AFF]",
          !positive && !info && "text-white/80",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Leaderboard() {
  const [rows, setRows] = useState(() => seedBoard());
  useEffect(() => {
    const id = setInterval(() => setRows(seedBoard()), 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <Card className="border-white/10 bg-white/5 text-white sm:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm text-white/70">
          Leaderboard
          <span className="text-[11px] text-white/40">Refreshes every 30s</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {rows.map((row, index) => (
          <div
            key={`leaderboard-${row.name}`}
            className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-right text-xs text-white/40">
                {index + 1}
              </span>
              <span className="text-sm text-white/80">{row.name}</span>
            </div>
            <div
              className={cn(
                "text-sm font-semibold",
                row.pnl >= 0 ? "text-[#66C800]" : "text-[#FC401F]",
              )}
            >
              {row.pnl >= 0 ? "+" : ""}
              {row.pnl.toFixed(4)} ETH
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function seedBoard() {
  const names = [
    "0x3a…8c2",
    "0x6f…b9e",
    "0x12…7aa",
    "0xa4…111",
    "0x9d…777",
    "0x21…dd0",
    "0x77…001",
    "0xe3…e3e",
    "0x5b…5b5",
    "0x42…424",
  ];
  return names.map((n) => ({ name: n, pnl: (Math.random() - 0.2) * 2 }));
}

// Weighted RNG to approximate house edge and rarity distribution
function weightedMultiplier() {
  const r = Math.random();
  // majority small losses/near break-even, rare big wins
  if (r < 0.25) return between(0.1, 0.5); // heavy loss
  if (r < 0.55) return between(0.5, 0.99); // small loss
  if (r < 0.8) return between(1.0, 2.0); // common win
  if (r < 0.94) return between(2.0, 5.0); // rare
  if (r < 0.985) return between(5.0, 20.0); // epic
  return between(20.0, 100.0); // legendary
}

function between(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function haptics(kind: "tiny" | "small" | "big") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    if (kind === "big") navigator.vibrate([40, 40, 60]);
    else if (kind === "small") navigator.vibrate(30);
    else navigator.vibrate(15);
  }
}

/**
 * Bottom Dock — mobile-first single thumb operation.
 */
function BottomControlsDock() {
  const [amount, setAmount] = useState(0.01);
  const [cards, setCards] = useState(1);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/50 backdrop-blur">
      <div className="mx-auto flex max-w-screen-md items-center gap-2 px-3 py-2">
        <Button
          size="icon"
          variant="ghost"
          className="text-white/80 hover:text-white"
          aria-label="Stats"
          title="Stats"
        >
          <Coins className="size-5" />
        </Button>
        <div className="flex min-w-0 grow items-center justify-center gap-2">
          <ControlStepper
            label="Amount (ETH)"
            value={amount}
            onChange={setAmount}
            step={0.005}
            min={0.001}
          />
          <ControlStepper
            label="Cards"
            value={cards}
            onChange={setCards}
            step={1}
            min={1}
          />
        </div>
        <Button className="ml-auto bg-[#0000FF] text-white hover:bg-[#0000E0]">
          <Play className="mr-2 size-4" />
          {cards} × {amount} ETH
        </Button>
      </div>
    </div>
  );
}

function ControlStepper({
  label,
  value,
  onChange,
  step,
  min,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-white">
      <button
        type="button"
        className="rounded-sm bg-white/10 px-2 py-1 text-white/80 hover:bg-white/15"
        onClick={() => onChange(Number(Math.max(min, value - step).toFixed(3)))}
        aria-label="Decrease"
      >
        −
      </button>
      <div className="min-w-[90px] text-center">
        <div className="text-[10px] text-white/50">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
      <button
        type="button"
        className="rounded-sm bg-white/10 px-2 py-1 text-white/80 hover:bg-white/15"
        onClick={() => onChange(Number((value + step).toFixed(3)))}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}

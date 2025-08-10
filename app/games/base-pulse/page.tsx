"use client";

import { Coins, DollarSign, PartyPopper, Rocket } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/header";
import {
  type Token,
  TokenStreamProvider,
  useTokenStream,
} from "@/components/token-stream";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

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
      <TokenStreamProvider>
        <div className="mx-auto max-w-screen-lg px-3 pb-28 pt-3 sm:pt-6">
          <Header howToPlay={<HowToPlay />} />
          <PulseGame />
        </div>
        <BottomDock />
      </TokenStreamProvider>
    </main>
  );
}

function HowToPlay() {
  return (
    <DialogContent className="max-w-md border-white/10 bg-black text-white">
      <DialogHeader>
        <DialogTitle className="text-center text-xl">
          How to Play — Base Pulse
        </DialogTitle>
      </DialogHeader>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-[#c0f28a]">
        <li>Pick any token from the stream</li>
        <li>Set your stake and press Start Ride</li>
        <li>Watch the live pulse for 20 seconds</li>
        <li>Tap Sell anytime to lock your payout</li>
        <li>If the token drops −35% from entry, it rugs and you lose</li>
        <li>House edge 3% applied on cash out</li>
      </ol>
      <Accordion type="single" collapsible className="mt-3">
        <AccordionItem value="fair">
          <AccordionTrigger className="text-sm">Provably Fair</AccordionTrigger>
          <AccordionContent className="text-sm text-white/70">
            Token updates will stream from Base (webhooks/SSE). This demo
            simulates real-time prices. Settlements are instant onchain with a
            transparent 3% fee.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="responsible">
          <AccordionTrigger className="text-sm">
            Responsible Gaming
          </AccordionTrigger>
          <AccordionContent className="text-sm text-white/70">
            Set loss limits, session timers, and self-exclusion in Settings. A
            break reminder appears after 50 rounds.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </DialogContent>
  );
}

/**
 * Main Game — not competitive. You vs. the pulse.
 */
function PulseGame() {
  const { tokens } = useTokenStream();
  const [activeId, setActiveId] = useState(tokens[0]?.id ?? "WIF");
  useEffect(() => {
    if (!tokens.find((t) => t.id === activeId))
      setActiveId(tokens[0]?.id ?? "WIF");
  }, [tokens, activeId]);

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_320px]">
      <RidePanel tokenId={activeId} />
      <HotTokensList activeId={activeId} onPick={setActiveId} />
    </div>
  );
}

function HotTokensList({
  activeId,
  onPick,
}: {
  activeId: string;
  onPick: (id: string) => void;
}) {
  const { tokens } = useTokenStream();
  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-white/70">
          Hot Tokens (simulated)
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {tokens.map((t) => (
          <button
            type="button"
            key={t.id}
            className={cn(
              "flex items-center justify-between rounded-md border px-3 py-2 text-left",
              "hover:bg-white/10 transition-colors",
              activeId === t.id
                ? "border-[#0000FF] bg-white/10"
                : "border-white/10 bg-white/5",
            )}
            onClick={() => onPick(t.id)}
          >
            <div className="flex items-center gap-3">
              <div
                className="size-8 rounded-md"
                style={{ backgroundColor: t.color }}
              />
              <div>
                <div className="text-sm font-semibold">{t.symbol}</div>
                <div className="text-[11px] text-white/60">{t.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={cn(
                  "text-sm font-semibold",
                  t.change1m >= 0 ? "text-[#66C800]" : "text-[#FC401F]",
                )}
              >
                {t.change1m >= 0 ? "+" : ""}
                {t.change1m.toFixed(1)}%
              </div>
              <div className="text-[11px] text-white/50">
                {t.price.toFixed(3)}
              </div>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

type Phase = "idle" | "riding" | "bust" | "won" | "settled";

function RidePanel({ tokenId }: { tokenId: string }) {
  const { getToken } = useTokenStream();
  const token: Token = getToken(tokenId) ?? {
    id: "-",
    symbol: "-",
    name: "-",
    color: "#ffffff",
    price: 0,
    change1m: 0,
    change5s: 0,
    volume: 0,
  };
  const [phase, setPhase] = useState<Phase>("idle");
  const [stake, setStake] = useState(0.01);
  const [entry, setEntry] = useState(token.price);
  const [timer, setTimer] = useState(20);
  const [pnl, setPnl] = useState(0);
  const [plays, setPlays] = useState(0);
  const [nearMiss, setNearMiss] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Keep entry aligned to token when starting
  useEffect(() => {
    if (phase === "idle") setEntry(token.price);
  }, [token.price, phase]);

  // Countdown manager
  useEffect(() => {
    if (phase !== "riding") return;
    setTimer(20);
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          intervalRef.current && clearInterval(intervalRef.current);
          sell("time");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: yolo
  }, [phase, sell]);

  // Bust line watcher
  useEffect(() => {
    if (phase !== "riding") return;
    const drawdown = (token.price / entry - 1) * 100;
    if (drawdown <= -35) {
      setPhase("bust");
      setPnl((b) => Number((b - stake).toFixed(6)));
      setNearMiss("Rugged! −35% from entry.");
      intervalRef.current && clearInterval(intervalRef.current);
    }
  }, [token.price, phase, entry, stake]);

  function startRide() {
    setNearMiss(null);
    setEntry(token.price);
    setPhase("riding");
    setPlays((n) => n + 1);
  }

  function sell(reason: "user" | "time") {
    if (phase !== "riding") return;
    // multiplier based on current price vs entry
    const grossMult = token.price / entry;
    const netMult = Math.max(0, grossMult * 0.97); // house edge 3%
    const payout = Number((stake * netMult).toFixed(6));
    const delta = payout - stake;
    setPnl((b) => Number((b + delta).toFixed(6)));
    setPhase(netMult <= 0 ? "bust" : "won");
    setNearMiss(
      reason === "time" && grossMult > 1 ? "Auto-sold at time!" : null,
    );
    intervalRef.current && clearInterval(intervalRef.current);
    // settle banner shows, then go back to idle
    setTimeout(() => setPhase("settled"), 1200);
  }

  const currentMult = useMemo(() => token.price / entry, [token.price, entry]);
  const currentNetMult = Math.max(0, currentMult * 0.97);

  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm text-white/70">
          <span>Base Pulse — {token.symbol}</span>
          <div className="flex items-center gap-4">
            <div className="text-xs text-white/60">Timer</div>
            <div className="rounded-md bg-white/10 px-2 py-1 text-sm font-mono">
              {phase === "riding" ? timer : "—"}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <BigTokenCard
          token={token}
          mult={currentNetMult}
          drawdownPct={(token.price / entry - 1) * 100}
        />

        <div className="grid grid-cols-2 gap-2">
          {phase === "riding" ? (
            <>
              <Button
                className="h-12 w-full bg-[#0000FF] text-white hover:bg-[#0000E0]"
                onClick={() => sell("user")}
              >
                <DollarSign className="mr-2 size-4" />
                Sell
              </Button>
              <Button
                variant="secondary"
                className="h-12 w-full bg-white text-black hover:bg-white/90"
                onClick={() => setPhase("idle")}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                className="h-12 w-full bg-[#0000FF] text-white hover:bg-[#0000E0]"
                onClick={startRide}
              >
                <Rocket className="mr-2 size-4" />
                Start Ride
              </Button>
              <Button
                variant="outline"
                className="h-12 w-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={() => {
                  setPhase("idle");
                  setEntry(token.price);
                }}
              >
                Reset
              </Button>
            </>
          )}
        </div>

        <StakeControls value={stake} onChange={setStake} />

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
          <div className="text-white/60">Rounds: {plays}</div>
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
        {phase === "won" && (
          <div className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-200">
            <PartyPopper className="mr-1 inline size-4" /> Legendary drop!
            Payout: {(stake * currentNetMult).toFixed(6)} ETH
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BigTokenCard({
  token,
  mult,
  drawdownPct,
}: {
  token: Token;
  mult: number;
  drawdownPct: number;
}) {
  const color =
    mult <= 0 || drawdownPct <= -35
      ? COLORS.red
      : mult >= 1
        ? COLORS.green
        : COLORS.cerulean;

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="size-10 rounded-md"
            style={{ backgroundColor: token.color }}
          />
          <div>
            <div className="text-lg font-bold text-white">{token.symbol}</div>
            <div className="text-xs text-white/60">{token.name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/60">Price</div>
          <div className="text-lg font-semibold text-white">
            {token.price.toFixed(4)}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div
          className="text-6xl font-extrabold tracking-tight"
          style={{ color }}
        >
          {mult.toFixed(2)}x
        </div>
        <div className="text-right">
          <div
            className={cn(
              "text-sm font-semibold",
              token.change5s >= 0 ? "text-[#66C800]" : "text-[#FC401F]",
            )}
          >
            {token.change5s >= 0 ? "+" : ""}
            {token.change5s.toFixed(2)}% / 5s
          </div>
          <div
            className={cn(
              "text-xs",
              token.change1m >= 0 ? "text-[#66C800]" : "text-[#FC401F]",
            )}
          >
            {token.change1m >= 0 ? "+" : ""}
            {token.change1m.toFixed(1)}% / 1m
          </div>
        </div>
      </div>

      {/* Soft animated grid like memedeck */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />
      </div>
    </div>
  );
}

function StakeControls({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [val, setVal] = useState(value);
  useEffect(() => setVal(value), [value]);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>Stake</span>
        <span>{value} ETH</span>
      </div>
      <Slider
        value={[val]}
        onValueChange={(v) => setVal(v[0] ?? value)}
        onValueCommit={(v) => onChange(Number((v[0] ?? value).toFixed(3)))}
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
              value === p && "border-[#0000FF] text-white",
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

function BottomDock() {
  const [autoSell, setAutoSell] = useState(true);
  const [limit, setLimit] = useState(10);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/50 backdrop-blur">
      <div className="mx-auto flex max-w-screen-lg items-center gap-3 px-3 py-2">
        <Button
          size="icon"
          variant="ghost"
          className="text-white/80 hover:text-white"
        >
          <Coins className="size-5" />
        </Button>
        <div className="text-xs text-white/60">
          Instant onchain loot. Built on Base.
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-white/70">
          <label className="flex items-center gap-2" htmlFor="auto-sell">
            <Switch checked={autoSell} onCheckedChange={setAutoSell} />
            Auto-sell at +{limit}%
          </label>
          <input
            type="number"
            value={limit}
            min={2}
            max={200}
            className="w-16 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-white"
            onChange={(e) => setLimit(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}

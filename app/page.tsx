"use client";

import { Crown, Rocket, Shield, Swords, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WalletConnect from "@/components/WalletConnect";

const COLORS = {
  baseBlue: "#0000FF",
  bg: "#0A0B0D",
};

export default function Home() {
  return (
    <main className="min-h-dvh w-full" style={{ backgroundColor: COLORS.bg }}>
      <div className="mx-auto max-w-screen-lg px-3 py-6">
        <Header />
        <Hero />
        <Onboarding />
        <GamesGrid />
      </div>
      <FooterDock />
    </main>
  );
}

function Header() {
  return (
    <header className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          aria-hidden
          className="grid size-7 grid-cols-2 gap-0.5 rounded-sm"
          style={{ filter: "drop-shadow(0 0 12px #0000FF)" }}
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
        <WalletConnect className="z-10" />
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="grid gap-6 p-6 md:grid-cols-2">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Instant onchain loot. Built on Base.
          </h1>
          <p className="mt-2 text-white/70">
            Four bite‑size games engineered for the scarcity loop. Simple, fast,
            and tactile. Play a demo or connect a wallet to start looting.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="#games">
              <Button className="bg-[#0000FF] text-white hover:bg-[#0000E0]">
                Choose a game
              </Button>
            </Link>
            <Link href="/games/dungeon">
              <Button
                variant="secondary"
                className="bg-white text-black hover:bg-white/90"
              >
                Play Dungeon demo
              </Button>
            </Link>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
            <Shield className="size-4" />
            <span>
              Provably fair coming soon on Base • Transparent house edge per
              game
            </span>
          </div>
        </div>
        <div className="relative">
          <img
            src="/neon-blue-grid.png"
            alt="Abstract Base themed grid"
            className="h-48 w-full rounded-lg object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function Onboarding() {
  return (
    <section className="mb-8">
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white/70">
            Get started in 3 steps
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Step
            num={1}
            title="Connect"
            body="Connect a Base wallet to play for real ETH or enter Demo mode."
            cta="Connect wallet"
          />
          <Step
            num={2}
            title="Pick a game"
            body="Choose a fast loop you like. Each round takes ~3 seconds."
            cta="See games"
            href="#games"
          />
          <Step
            num={3}
            title="Play"
            body="Open loot, time the lock, ride the pulse, or brave the dungeon. Cash out anytime."
            cta="Play a demo"
            href="/games/loot-drop"
          />
        </CardContent>
      </Card>
    </section>
  );
}

function Step({
  num,
  title,
  body,
  cta,
  href,
}: {
  num: number;
  title: string;
  body: string;
  cta: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-2 inline-flex size-7 items-center justify-center rounded-full bg-[#0000FF]/20 text-xs font-bold text-[#aab5ff]">
        {num}
      </div>
      <div className="text-white">{title}</div>
      <p className="mt-1 text-sm text-white/60">{body}</p>
      <div className="mt-3">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="border-white/15 bg-white/5 text-white hover:bg-white/10"
        >
          {href ? (
            <Link href={href}>{cta}</Link>
          ) : (
            <span className="pointer-events-none">{cta}</span>
          )}
        </Button>
      </div>
    </div>
  );
  return content;
}

function GamesGrid() {
  return (
    <section id="games" className="mb-12">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Games</h2>
        <div className="text-xs text-white/50">
          Simple loops • 3s animations • Cash out anytime
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <GameCard
          title="Loot Drop Multiplier"
          desc="Stake and crack open glowing chests. Multipliers from 0.1x to 100x. Legendary drops sparkle."
          image="/glowing-treasure-chest.png"
          href="/games/loot-drop"
          edge="3%"
          icon={<Zap className="size-4" />}
        />
        <GameCard
          title="Orbital Lock"
          desc="A rotating pointer and a shrinking safe arc. Tap Lock at the right moment to climb the multiplier."
          image="/neon-circular-hud.png"
          href="/games/orbital-lock"
          edge="3%"
          icon={<Rocket className="size-4" />}
        />
        <GameCard
          title="Base Pulse"
          desc="Ride ultra‑short pulses from live tokens on Base. Sell anytime in a 20s window."
          image="/neon-market-pulse-candles.png"
          href="/games/base-pulse"
          edge="3%"
          icon={<TrendingUp className="size-4" />}
        />
        <GameCard
          title="Dungeon Gauntlet"
          desc="Turn‑based dungeon crawl using the Death Fun math. Choose a door each level; one trap busts to 0."
          image="/medieval-dungeon-blue-glow.png"
          href="/games/dungeon"
          edge="5%"
          icon={<Swords className="size-4" />}
        />
      </div>
    </section>
  );
}

function GameCard({
  title,
  desc,
  image,
  href,
  edge,
  icon,
}: {
  title: string;
  desc: string;
  image: string;
  href: string;
  edge: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm text-white/80">
          <span className="inline-flex items-center gap-2">
            {icon}
            {title}
          </span>
          <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-white/70">
            House {edge}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <img
          src={image}
          alt={`${title} artwork`}
          className="h-40 w-full rounded-md object-cover"
        />
        <p className="mt-3 text-sm text-white/70">{desc}</p>
        <div className="mt-3 flex gap-2">
          <Link href={href}>
            <Button className="bg-[#0000FF] text-white hover:bg-[#0000E0]">
              Play
            </Button>
          </Link>
          <Link href={href}>
            <Button
              variant="secondary"
              className="bg-white text-black hover:bg-white/90"
            >
              Demo
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function FooterDock() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/50 backdrop-blur">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <Crown className="size-4" />
          <span>Join thousands opening loot on Base</span>
        </div>
        <div className="text-xs text-white/50">
          Provably fair. Instantly settled. Always onchain.
        </div>
      </div>
    </div>
  );
}

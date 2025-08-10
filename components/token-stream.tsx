"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Token = {
  id: string;
  symbol: string;
  name: string;
  color: string;
  price: number; // base = 1.0 at boot
  change1m: number; // %
  change5s: number; // %
  volume: number; // arbitrary units for flair
};

type StreamCtx = {
  tokens: Token[];
  getToken: (id: string) => Token | undefined;
  inject: (updates: { symbol?: string; id?: string; price: number }[]) => void;
};

const StreamContext = createContext<StreamCtx | null>(null);

const STARTERS: Token[] = [
  {
    id: "WIF",
    symbol: "WIF",
    name: "whiff",
    color: "#66C800",
    price: 1,
    change1m: 0,
    change5s: 0,
    volume: 1200,
  },
  {
    id: "OMG",
    symbol: "OMG",
    name: "comeback",
    color: "#FFD12F",
    price: 1,
    change1m: 0,
    change5s: 0,
    volume: 860,
  },
  {
    id: "PRK",
    symbol: "PRK",
    name: "parkify",
    color: "#3C8AFF",
    price: 1,
    change1m: 0,
    change5s: 0,
    volume: 540,
  },
  {
    id: "KOK",
    symbol: "KOK",
    name: "KOKOK",
    color: "#E879F9",
    price: 1,
    change1m: 0,
    change5s: 0,
    volume: 320,
  },
  {
    id: "ETH",
    symbol: "ETH",
    name: "ETH",
    color: "#A3A3A3",
    price: 1,
    change1m: 0,
    change5s: 0,
    volume: 5000,
  },
];

export function TokenStreamProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tokens, setTokens] = useState<Token[]>(STARTERS);
  const ring1m = useRef<Record<string, number[]>>({});
  const ring5s = useRef<Record<string, number[]>>({});

  // init rings
  useEffect(() => {
    for (const t of STARTERS) {
      ring1m.current[t.id] = Array(60).fill(t.price);
      ring5s.current[t.id] = Array(10).fill(t.price);
    }
  }, []);

  // random walk simulation at 250ms tick
  useEffect(() => {
    const tick = () => {
      setTokens((prev) =>
        prev.map((t) => {
          // base volatility
          const vol = 0.006 + Math.random() * 0.012; // 0.6% - 1.8% step
          const drift = (Math.random() - 0.48) * vol; // slightly biased downward to pay the house in the long run
          let next = t.price * (1 + drift);
          // occasional spikes or dumps
          if (Math.random() < 0.015)
            next *= 1 + (Math.random() < 0.5 ? 0.15 : -0.12);
          // keep sane bounds
          next = Math.max(0.3, Math.min(3.0, next));

          // update rings
          const r1 = ring1m.current[t.id] || [t.price];
          const r5 = ring5s.current[t.id] || [t.price];
          r1.push(next);
          if (r1.length > 60) r1.shift();
          r5.push(next);
          if (r5.length > 10) r5.shift();
          ring1m.current[t.id] = r1;
          ring5s.current[t.id] = r5;

          const base1m = r1[0] || next;
          const base5s = r5[0] || next;

          return {
            ...t,
            price: Number(next.toFixed(4)),
            change1m: (next / base1m - 1) * 100,
            change5s: (next / base5s - 1) * 100,
            volume: Math.max(0, t.volume + (Math.random() - 0.4) * 5),
          };
        }),
      );
    };
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: yolo
  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny: weshipping
    (window as any).lootInject = (
      updates: { symbol?: string; id?: string; price: number }[],
    ) => {
      inject(updates);
    };
  }, []);

  const getToken = (id: string) =>
    tokens.find((t) => t.id === id || t.symbol === id);

  const inject = (
    updates: { symbol?: string; id?: string; price: number }[],
  ) => {
    setTokens((prev) =>
      prev.map((t) => {
        const u = updates.find((u) => u.id === t.id || u.symbol === t.symbol);
        if (!u) return t;
        const next = Number(u.price);
        const r1 = ring1m.current[t.id] || [t.price];
        const r5 = ring5s.current[t.id] || [t.price];
        r1.push(next);
        if (r1.length > 60) r1.shift();
        r5.push(next);
        if (r5.length > 10) r5.shift();
        ring1m.current[t.id] = r1;
        ring5s.current[t.id] = r5;
        const base1m = r1[0] || next;
        const base5s = r5[0] || next;
        return {
          ...t,
          price: Number(next.toFixed(4)),
          change1m: (next / base1m - 1) * 100,
          change5s: (next / base5s - 1) * 100,
        };
      }),
    );
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: what in tarnation
  const value = useMemo<StreamCtx>(
    () => ({ tokens, getToken, inject }),
    [tokens],
  );

  return (
    <StreamContext.Provider value={value}>{children}</StreamContext.Provider>
  );
}

export function useTokenStream(): StreamCtx {
  const ctx = useContext(StreamContext);
  if (!ctx)
    throw new Error("useTokenStream must be used within TokenStreamProvider");
  return ctx;
}

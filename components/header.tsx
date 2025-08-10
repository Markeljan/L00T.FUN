"use client";

import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { HelpCircle, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import WalletConnect from "@/components/WalletConnect";
import { COLORS } from "@/lib/utils";

export const Header = ({ howToPlay }: { howToPlay?: React.ReactNode }) => {
  const [muted, setMuted] = useState(true);
  return (
    <header className="mb-3 flex items-center justify-between">
      <a href="/" className="flex items-center gap-2 cursor-pointer">
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
      </a>
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
          {howToPlay}
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
};

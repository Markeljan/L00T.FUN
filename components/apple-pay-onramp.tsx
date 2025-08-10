"use client";

import { ExternalLinkIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function ApplePayOnramp() {
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paymentLink, setPaymentLink] = useState<string>("");
  const [error, setError] = useState<string>("");

  const isValid = useMemo(() => {
    // whole number USDC, >= 1
    if (!amount) return false;
    if (!/^[0-9]+$/.test(amount)) return false;
    const n = Number(amount);
    return Number.isInteger(n) && n >= 1;
  }, [amount]);

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsLoading(true);
    setError("");
    setPaymentLink("");

    try {
      const response = await fetch(
        `/api/apple-pay-onramp?fiatAmount=${amount}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get payment link");
      }

      if (data.paymentLink) {
        setPaymentLink(data.paymentLink);
      } else {
        throw new Error("No payment link received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm border-border/60 shadow-sm">
      <CardHeader className="pb-2 relative">
        <CardTitle className="text-base">Apple&nbsp;Pay Onramp</CardTitle>
        <button
          type="button"
          className="absolute top-2 right-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          aria-label="Apple Pay"
        >
          <img
            src="/apple-pay.svg"
            alt="Apple Pay"
            className="h-6 w-auto"
            loading="lazy"
          />
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="fiatAmount" className="text-sm">
              Amount
            </Label>
            <div className="relative">
              <Input
                id="fiatAmount"
                name="fiatAmount"
                placeholder="100"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                step={1}
                value={amount}
                onChange={(e) => {
                  // allow only digits
                  const v = e.target.value.replace(/[^\d]/g, "");
                  setAmount(v);
                  // Clear previous results when amount changes
                  setPaymentLink("");
                  setError("");
                }}
                className="pr-16 text-sm h-9"
                aria-invalid={!isValid && amount.length > 0}
                disabled={isLoading}
              />
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">
                USDC
              </span>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {paymentLink ? (
            <a
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "w-full h-9 rounded-lg border shadow-sm transition-all",
                "bg-black text-white hover:bg-black/90",
                "flex items-center justify-center text-sm font-medium",
              )}
            >
              Continue with Apple Pay <ExternalLinkIcon className="w-4 h-4" />
            </a>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || isLoading}
              className={cn(
                "w-full h-9 rounded-lg border shadow-sm transition-all",
                "bg-black text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center text-sm font-medium",
              )}
            >
              {isLoading ? "Loading..." : "Submit"}
            </button>
          )}
        </div>

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {isValid
            ? `Ready to buy ${amount} USDC`
            : "Enter a valid whole number amount"}
        </div>
      </CardContent>
    </Card>
  );
}

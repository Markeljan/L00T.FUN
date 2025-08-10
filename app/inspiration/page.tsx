export default function Inspiration() {
  return (
    <main
      className="mx-auto max-w-5xl space-y-6 px-4 py-8 text-white"
      style={{ backgroundColor: "#0A0B0D" }}
    >
      <h1 className="text-2xl font-bold">Inspiration</h1>
      <p className="text-white/70">
        Reference screenshots used for visual direction.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <figure className="rounded-lg border border-white/10 bg-white/5 p-2">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/death.fun__r%3DBEGZV3-URxjuEvvNz7MM7xsEiemzkxTOwIlbK.png"
            alt="death.fun desktop screenshot"
            className="w-full rounded-md"
          />
          <figcaption className="mt-2 text-xs text-white/60">
            death.fun — desktop layout and leaderboard
          </figcaption>
        </figure>
        <figure className="rounded-lg border border-white/10 bg-white/5 p-2">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/memedeck.win_%28iPhone%2014%20Pro%20Max%29-V8S4ICx3LOVgtAZyBM0U2NCJbtn33v.png"
            alt="memedeck mobile screenshot"
            className="w-full rounded-md"
          />
          <figcaption className="mt-2 text-xs text-white/60">
            memedeck — mobile CTA and controls
          </figcaption>
        </figure>
        <figure className="rounded-lg border border-white/10 bg-white/5 p-2">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/death.fun_%28iPhone%2014%20Pro%20Max%29-2LNS5olKqzksoVqpMPP3OfVZqwKGh2.png"
            alt="death.fun mobile screenshot"
            className="w-full rounded-md"
          />
          <figcaption className="mt-2 text-xs text-white/60">
            death.fun — mobile nav and bottom sheet
          </figcaption>
        </figure>
        <figure className="rounded-lg border border-white/10 bg-white/5 p-2">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/memedeck.win_-oi3AHz5Bhf7ZUa5aeTtj0TAi6j5jGu.png"
            alt="memedeck desktop screenshot"
            className="w-full rounded-md"
          />
          <figcaption className="mt-2 text-xs text-white/60">
            memedeck — multi-card layout and control rail
          </figcaption>
        </figure>
        <figure className="rounded-lg border border-white/10 bg-white/5 p-2 md:col-span-2">
          <img
            src="https://sjc.microlink.io/uhdkor4-6NcScpqNdcTb3B_gRzS9y-7rS-9Wv30xfCG0Oca-2ThdGifOtJqRnH6f28enEO80urG8_5aUwuwXiQ.jpeg"
            alt="Starter miniapp screen"
            className="w-full rounded-md"
          />
          <figcaption className="mt-2 text-xs text-white/60">
            L00T.fun starter template to replace
          </figcaption>
        </figure>
      </div>
    </main>
  );
}

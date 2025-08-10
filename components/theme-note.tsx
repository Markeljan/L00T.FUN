export default function ThemeNote() {
  // Utility note component if you want to drop into other pages
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3 text-xs text-white/70">
      Uses Base palette: Base Blue (#0000FF), background Gray 100 (#0A0B0D),
      Green (#66C800) for wins, Red (#FC401F) for losses, Yellow (#FFD12F) for
      bonuses, Cerulean (#3C8AFF) for info.
    </div>
  );
}

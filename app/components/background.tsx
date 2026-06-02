export function Background() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
      <div className="absolute inset-0 grid-bg [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_82%,transparent)]" />
      <div className="absolute inset-0 grain" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

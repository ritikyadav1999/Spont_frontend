import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="offline-shell flex min-h-screen items-center justify-center px-5 py-10">
      <section className="offline-card w-full max-w-xl rounded-[2rem] p-8 sm:p-10">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/14 text-xl font-black text-primary">
          S
        </div>

        <p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-primary/80">
          Offline Mode
        </p>
        <h1 className="font-headline text-[2.35rem] font-black tracking-[-0.05em] text-on-surface">
          You&apos;re offline right now
        </h1>
        <p className="mt-4 max-w-lg text-base leading-7 text-on-surface-variant">
          Spont is installed and ready, but this screen needs a connection or cached data to load fully.
          Try again once your network is back.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center rounded-full bg-primary-container px-6 py-3.5 text-sm font-bold text-on-primary-container transition-transform hover:scale-[1.01]"
            href="/discover"
          >
            Try Discover Again
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-full bg-surface-container px-6 py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
            href="/"
          >
            Go Home
          </Link>
        </div>
      </section>
    </main>
  );
}

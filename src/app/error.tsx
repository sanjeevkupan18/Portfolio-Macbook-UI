"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="fixed inset-0 grid place-items-center bg-black p-6 text-center text-white">
      <div className="max-w-sm">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-white/60">The portfolio hit an unexpected problem. You can try again.</p>
        <button type="button" onClick={reset} className="mt-5 h-9 rounded-lg bg-white px-4 text-sm font-medium text-black">Restart</button>
      </div>
    </div>
  );
}

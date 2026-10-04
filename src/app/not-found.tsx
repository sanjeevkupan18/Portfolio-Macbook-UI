import Link from "next/link";

export default function NotFound() {
  return (
    <main className="fixed inset-0 grid place-items-center bg-black p-6 text-center text-white">
      <div className="max-w-sm">
        <p className="text-6xl font-semibold tracking-tight">404</p>
        <h1 className="mt-2 text-lg font-semibold">This file couldn’t be found</h1>
        <p className="mt-1 text-sm text-white/60">The page you’re looking for doesn’t exist on this desktop.</p>
        <Link href="/" className="mt-5 inline-flex h-9 items-center rounded-lg bg-white px-4 text-sm font-medium text-black">Back to Desktop</Link>
      </div>
    </main>
  );
}

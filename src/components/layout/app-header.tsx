"use client";

export function AppHeader({ title }: { title: string }) {
  return (
    <header className="bg-background flex h-14 items-center border-b px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}

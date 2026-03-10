'use client';

import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/upload': 'Upload Dataset',
  '/dashboard/datasets': 'Datasets',
};

export function Topbar() {
  const pathname = usePathname();

  const title =
    Object.entries(PAGE_TITLES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([key]) => pathname.startsWith(key))?.[1] ?? 'Dashboard';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
    </header>
  );
}

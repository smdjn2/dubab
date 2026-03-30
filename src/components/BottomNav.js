'use client';

import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { path: '/', label: '홈', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10' },
  { path: '/search', label: '검색', icon: 'M21 21l-4.35-4.35 M11 19a8 8 0 100-16 8 8 0 000 16z' },
  { path: '/create', label: '모집하기', isCenter: true },
  { path: '/alerts', label: '알림', icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0' },
  { path: '/my', label: '마이', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 flex justify-around py-2 pb-[calc(8px+env(safe-area-inset-bottom))] z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.path || (item.path === '/' && pathname === '/');

        if (item.isCenter) {
          return (
            <button
              key={item.path}
              onClick={() => router.push('/create')}
              className="flex flex-col items-center gap-1 relative -top-2"
            >
              <div className="w-12 h-12 rounded-full bg-sage-400 flex items-center justify-center text-white shadow-lg shadow-sage-400/40">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span className="text-[11px]">{item.label}</span>
            </button>
          );
        }

        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] border-none bg-transparent cursor-pointer transition-colors ${isActive ? 'text-sage-500' : 'text-gray-400'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {item.icon.split(' M').map((d, i) => (
                <path key={i} d={i === 0 ? d : 'M' + d} />
              ))}
            </svg>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
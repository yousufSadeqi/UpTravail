'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Messages', href: '/messages' },
    { name: 'Wallet', href: '/wallet' },
  ];

  if (!session) return null;

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-800">
              Banking System
            </Link>
            
            <div className="ml-10 flex items-center space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            {session.user?.email && (
              <span className="text-sm text-gray-700 mr-4">
                {session.user.email}
              </span>
            )}
            <Link
              href="/api/auth/signout"
              className="text-sm text-gray-700 hover:text-gray-900"
            >
              Sign out
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
} 
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group justify-center mb-8">
          <div className="relative w-7 h-7 bg-primary rounded-md flex items-center justify-center overflow-hidden">
            <ArrowUpRight 
              className="w-4 h-4 text-white group-hover:translate-x-[1px] group-hover:-translate-y-[1px] transition-transform" 
              strokeWidth={2.5}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary via-transparent to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-primary">Up</span>
            <span className="text-textColor">Travail</span>
            <span className="text-primary">.</span>
          </span>
        </Link>

        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
} 
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowRight, Star, Shield, Clock } from 'lucide-react';
import { inputStyles } from '@/lib/utils/styles';
import { useSearch } from '@/lib/hooks/useSearch';

const popularCategories = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Home Repair',
];

const features = [
  {
    icon: Star,
    title: 'Verified Professionals',
    description: 'All service providers are pre-screened and qualified',
    stat: '2,000+',
    statLabel: 'Verified Pros'
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Your payments are protected until job completion',
    stat: '100%',
    statLabel: 'Payment Protection'
  },
  {
    icon: Clock,
    title: 'Quick Response',
    description: 'Get matched with professionals within hours',
    stat: '< 2hrs',
    statLabel: 'Avg. Response'
  }
];

export default function HeroSection() {
  const { searchQuery, handleSearch } = useSearch();

  return (
    <section className="relative bg-gradient-to-r from-primary to-primary-dark text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6 inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium">
            🌟 Trusted by 10,000+ customers
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find the Perfect Professional
            <span className="block text-accent mt-2">for Your Project</span>
          </h1>
          
          <p className="text-xl mb-12 text-gray-100">
            Connect with skilled professionals for home repairs, renovations, and more
          </p>

          <div className="relative max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="search"
                placeholder="What service do you need?"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={`${inputStyles} pl-12 pr-4 py-4 w-full text-lg rounded-full shadow-lg focus:shadow-xl transition-shadow`}
                style={{ color: 'black' }}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-colors"
                onClick={() => searchQuery && handleSearch(searchQuery)}
              >
                Search
              </button>
            </div>

            <div className="mt-4 text-sm">
              <span className="opacity-80">Popular:</span>{' '}
              <div className="inline-flex flex-wrap gap-2 justify-center">
                {popularCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleSearch(category)}
                    className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group relative bg-white/5 backdrop-blur-sm rounded-xl p-8 hover:bg-white/10 transition-all duration-300 overflow-hidden"
              >
                {/* Background Accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Icon Container */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative space-y-4">
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-2xl font-bold text-accent">
                      {feature.stat}
                    </div>
                    <div className="text-sm text-gray-300">
                      {feature.statLabel}
                    </div>
                  </div>
                </div>

                {/* Hover Indicator */}
                <div className="absolute bottom-0 left-0 h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12">
            <Link 
              href="/auth/register"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-full font-medium transition-colors"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 
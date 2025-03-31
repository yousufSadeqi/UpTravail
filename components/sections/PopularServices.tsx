'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { inputStyles } from '@/lib/utils/styles';
import { useState, useEffect } from 'react';
import { useSearch } from '@/lib/hooks/useSearch';

interface ServiceCardProps {
  title: string;
  jobCount: number;
  avgRate: string;
  image: string;
}

const services: ServiceCardProps[] = [
  {
    title: "Plumbing",
    jobCount: 150,
    avgRate: "$45/hr",
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&h=500"
  },
  {
    title: "Electrical",
    jobCount: 200,
    avgRate: "$55/hr",
    image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&h=500"
  },
  {
    title: "Construction",
    jobCount: 180,
    avgRate: "$60/hr",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&h=500"
  },
  {
    title: "Home Repair",
    jobCount: 120,
    avgRate: "$40/hr",
    image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&h=500"
  }
];

export default function PopularServices() {
  const { searchQuery, handleSearch } = useSearch();
  const [filteredServices, setFilteredServices] = useState(services);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = services.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  }, [searchQuery]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-gray-900">Browse by Category</h2>
        <div className="relative max-w-md mx-auto mb-8">
          <input
            type="search"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className={`${inputStyles} pl-10`}
            style={{ color: 'black' }}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        
        {filteredServices.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            No services found matching "{searchQuery}"
          </div>
        )}
      </div>
    </section>
  );
}

function ServiceCard({ title, jobCount, avgRate, image }: ServiceCardProps) {
  return (
    <Link href={`/services/${title.toLowerCase()}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
        <div className="relative h-48 w-full">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-gray-600">
            {jobCount} jobs available • {avgRate}
          </p>
        </div>
      </div>
    </Link>
  );
} 
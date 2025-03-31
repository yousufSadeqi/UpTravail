'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Search, Sliders, Filter as FilterIcon } from 'lucide-react';
import { inputStyles } from '@/lib/utils/styles';
import { useSearch } from '@/lib/hooks/useSearch';

interface SearchResult {
  id: string;
  title: string;
  category: string;
  description: string;
  price: string;
  rating: number;
  reviews: number;
  location: string;
  availability: 'Available Now' | 'Available Soon' | 'Busy';
}

interface Filters {
  category: string;
  priceRange: [number, number];
  rating: number;
  availability: string;
  location: string;
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Professional Plumbing Service',
    category: 'Plumbing',
    description: 'Expert plumbing services for all your needs',
    price: '$45/hr',
    rating: 4.8,
    reviews: 156,
    location: 'San Francisco, CA',
    availability: 'Available Now'
  },
  {
    id: '2',
    title: 'Electrical Installation & Repair',
    category: 'Electrical',
    description: 'Licensed electrician for residential and commercial projects',
    price: '$60/hr',
    rating: 4.9,
    reviews: 203,
    location: 'San Jose, CA',
    availability: 'Available Soon'
  },
  {
    id: '3',
    title: 'Home Renovation Specialist',
    category: 'Construction',
    description: 'Complete home renovation and remodeling services',
    price: '$75/hr',
    rating: 4.7,
    reviews: 89,
    location: 'Oakland, CA',
    availability: 'Available Now'
  }
];

const categories = ['All', 'Plumbing', 'Electrical', 'Construction', 'Painting', 'Carpentry'];
const locations = ['All', 'San Francisco, CA', 'San Jose, CA', 'Oakland, CA'];
const availabilityOptions = ['All', 'Available Now', 'Available Soon', 'Busy'];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { searchQuery, handleSearch } = useSearch(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    category: 'All',
    priceRange: [0, 100],
    rating: 0,
    availability: 'All',
    location: 'All'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyFilters = (results: SearchResult[]) => {
    return results.filter(result => {
      const matchesCategory = filters.category === 'All' || result.category === filters.category;
      const price = parseInt(result.price.split('/hr')[0]);
      const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1];
      const matchesRating = result.rating >= filters.rating;
      const matchesAvailability = filters.availability === 'All' || result.availability === filters.availability;
      const matchesLocation = filters.location === 'All' || result.location === filters.location;

      return matchesCategory && matchesPrice && matchesRating && matchesAvailability && matchesLocation;
    });
  };

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      setError(null);

      try {
        if (!searchQuery.trim()) {
          setResults([]);
          return;
        }

        const data = mockResults.filter(result =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setResults(data);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch results');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [searchQuery]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Search Results</h1>
          <div className="relative">
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
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Filters</h2>
                <button
                  onClick={() => setFilters({
                    category: 'All',
                    priceRange: [0, 100],
                    rating: 0,
                    availability: 'All',
                    location: 'All'
                  })}
                  className="text-sm text-primary hover:text-primary/90"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className={inputStyles}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range ($/hr)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={(e) => setFilters({
                        ...filters,
                        priceRange: [parseInt(e.target.value), filters.priceRange[1]]
                      })}
                      className={`${inputStyles} w-20`}
                      min={0}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters({
                        ...filters,
                        priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                      })}
                      className={`${inputStyles} w-20`}
                      min={0}
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({ ...filters, rating: parseFloat(e.target.value) })}
                    className={inputStyles}
                  >
                    <option value={0}>Any Rating</option>
                    <option value={4.5}>4.5+ ⭐</option>
                    <option value={4.0}>4.0+ ⭐</option>
                    <option value={3.5}>3.5+ ⭐</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className={inputStyles}
                  >
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                    className={inputStyles}
                  >
                    {availabilityOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-6">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold mb-2">{result.title}</h2>
                        <p className="text-gray-600 mb-2">{result.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{result.category}</span>
                          <span>•</span>
                          <span>{result.price}</span>
                          <span>•</span>
                          <span>⭐ {result.rating} ({result.reviews} reviews)</span>
                        </div>
                      </div>
                      <button className="btn-primary">Contact</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  No results found for "{searchQuery}". Try a different search term.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, Filter, Star, ArrowUpDown } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
  description: string;
}

const services: Service[] = [
  {
    id: '1',
    title: 'Professional Plumbing Services',
    category: 'Plumbing',
    rating: 4.8,
    reviews: 156,
    price: 45,
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&h=500',
    description: 'Expert plumbing services for residential and commercial properties'
  },
  {
    id: '2',
    title: 'Electrical Installation & Repair',
    category: 'Electrical',
    rating: 4.9,
    reviews: 203,
    price: 55,
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&h=500',
    description: 'Licensed electricians for all your electrical needs'
  },
  {
    id: '3',
    title: 'House Painting Services',
    category: 'Painting',
    rating: 4.7,
    reviews: 128,
    price: 35,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&h=500',
    description: 'Professional interior and exterior painting services'
  },
  {
    id: '4',
    title: 'Home Cleaning Service',
    category: 'Cleaning',
    rating: 4.6,
    reviews: 312,
    price: 30,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&h=500',
    description: 'Thorough home cleaning and sanitization services'
  },
  {
    id: '5',
    title: 'Moving & Packing',
    category: 'Moving',
    rating: 4.8,
    reviews: 167,
    price: 65,
    image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=800&h=500',
    description: 'Professional moving services with careful handling'
  },
  {
    id: '6',
    title: 'Home Renovation',
    category: 'Construction',
    rating: 4.9,
    reviews: 184,
    price: 75,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&h=500',
    description: 'Complete home renovation and remodeling services'
  },
  {
    id: '7',
    title: 'Lawn Care & Landscaping',
    category: 'Gardening',
    rating: 4.7,
    reviews: 143,
    price: 40,
    image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&w=800&h=500',
    description: 'Professional lawn maintenance and landscaping'
  },
  {
    id: '8',
    title: 'HVAC Maintenance',
    category: 'HVAC',
    rating: 4.8,
    reviews: 198,
    price: 60,
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&h=500',
    description: 'Heating, ventilation, and AC repair services'
  },
  {
    id: '9',
    title: 'Carpet Cleaning',
    category: 'Cleaning',
    rating: 4.6,
    reviews: 145,
    price: 35,
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&h=500',
    description: 'Deep carpet cleaning and stain removal services'
  },
  {
    id: '10',
    title: 'Security System Installation',
    category: 'Security',
    rating: 4.9,
    reviews: 132,
    price: 70,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&h=500',
    description: 'Home security system installation and monitoring'
  }
];

const categories = [
  'All',
  'Plumbing',
  'Electrical',
  'Construction',
  'Cleaning',
  'Moving',
  'Painting',
  'Gardening',
  'HVAC',
  'Security'
];
const sortOptions = ['Recommended', 'Highest Rated', 'Lowest Price', 'Highest Price'];

export default function BrowseServices() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Recommended');
  const [showFilters, setShowFilters] = useState(false);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'Highest Rated':
        return b.rating - a.rating;
      case 'Lowest Price':
        return a.price - b.price;
      case 'Highest Price':
        return b.price - a.price;
      default:
        return b.reviews - a.reviews;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Search and Filter Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="search"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {sortOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                      ${selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedServices.map(service => (
            <div key={service.id} className="bg-white rounded-xl shadow-md overflow-hidden group">
              {/* Image */}
              <div className="relative h-48">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 fill-yellow-400 stroke-yellow-400" />
                  <span className="font-medium">{service.rating}</span>
                  <span className="text-gray-500">({service.reviews} reviews)</span>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between">
                  <div className="text-primary font-semibold">${service.price}/hr</div>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
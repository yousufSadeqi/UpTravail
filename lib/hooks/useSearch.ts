'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useSearch(initialQuery = '') {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSearching && searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearching, router]);

  return {
    searchQuery,
    handleSearch,
    isSearching
  };
} 
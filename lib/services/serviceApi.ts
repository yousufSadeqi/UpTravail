import { supabase } from '@/lib/supabase';
import { Service } from '@/lib/types/service';

interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  location?: string;
  availability?: string;
}

export async function searchServices(query: string, filters: SearchFilters) {
  try {
    let queryBuilder = supabase
      .from('services')
      .select('*');

    // Add search query if provided
    if (query) {
      queryBuilder = queryBuilder.ilike('title', `%${query}%`);
    }

    // Apply filters
    if (filters.category && filters.category !== 'All') {
      queryBuilder = queryBuilder.eq('category', filters.category);
    }

    if (filters.minPrice) {
      queryBuilder = queryBuilder.gte('price_per_hour', filters.minPrice);
    }

    if (filters.maxPrice) {
      queryBuilder = queryBuilder.lte('price_per_hour', filters.maxPrice);
    }

    if (filters.minRating) {
      queryBuilder = queryBuilder.gte('rating', filters.minRating);
    }

    if (filters.location && filters.location !== 'All') {
      queryBuilder = queryBuilder.eq('location', filters.location);
    }

    if (filters.availability && filters.availability !== 'All') {
      queryBuilder = queryBuilder.eq('availability', filters.availability);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }

    return data as Service[];
  } catch (error) {
    console.error('Search services error:', error);
    throw error;
  }
}

export async function getServiceById(id: string) {
  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      reviews (
        id,
        rating,
        comment,
        created_at,
        user_id,
        profiles (full_name, avatar_url)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count'>) {
  const { data, error } = await supabase
    .from('services')
    .insert(service)
    .select()
    .single();

  if (error) throw error;
  return data;
} 
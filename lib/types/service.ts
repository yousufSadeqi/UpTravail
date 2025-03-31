export interface Service {
  id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  price_per_hour: number;
  location: string;
  availability: 'Available Now' | 'Available Soon' | 'Busy';
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  service_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
} 
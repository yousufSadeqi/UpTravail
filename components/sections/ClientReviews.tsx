import Image from 'next/image';
import { Star } from 'lucide-react';

interface ReviewProps {
  id: number;
  author: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

const reviews: ReviewProps[] = [
  {
    id: 1,
    author: 'Emily Thompson',
    role: 'Homeowner',
    content: 'Found an amazing plumber through this platform. Quick response and professional service!',
    rating: 5,
    image: '/reviews/emily.jpg',
  },
  {
    id: 2,
    author: 'Michael Chen',
    role: 'Business Owner',
    content: 'The electrical work was done perfectly. Very satisfied with the service quality.',
    rating: 5,
    image: '/reviews/michael.jpg',
  },
  {
    id: 3,
    author: 'Sarah Wilson',
    role: 'Property Manager',
    content: 'Great platform for finding reliable professionals. Saved me so much time!',
    rating: 4,
    image: '/reviews/sarah.jpg',
  },
];

export default function ClientReviews() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-black">What Clients Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} {...review} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ author, role, content, rating, image }: Omit<ReviewProps, 'id'>) {
  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex items-center gap-4 mb-4">
        <Image
          src={image}
          alt={author}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div>
          <h3 className="font-semibold text-gray-800">{author}</h3>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
      <div className="flex items-center mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill={i < rating ? 'currentColor' : 'none'}
          />
        ))}
      </div>
      <p className="text-gray-600">{content}</p>
    </div>
  );
} 
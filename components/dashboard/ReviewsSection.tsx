'use client';

import { useState } from 'react';
import { Star, ThumbsUp, Calendar } from 'lucide-react';

interface Review {
  id: string;
  clientName: string;
  jobTitle: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  response?: string;
}

export default function ReviewsSection() {
  const [reviews] = useState<Review[]>([
    {
      id: '1',
      clientName: 'Sarah Johnson',
      jobTitle: 'Bathroom Renovation',
      rating: 5,
      comment: 'Excellent work! Very professional and completed the job ahead of schedule. The bathroom looks amazing and everything works perfectly.',
      date: '2 weeks ago',
      helpful: 3,
      response: 'Thank you for your kind words, Sarah! It was a pleasure working on your bathroom renovation.'
    },
    {
      id: '2',
      clientName: 'Mike Thompson',
      jobTitle: 'Electrical System Repair',
      rating: 4,
      comment: 'Did a great job fixing our electrical issues. Very knowledgeable and explained everything clearly.',
      date: '1 month ago',
      helpful: 2
    },
    // Add more reviews...
  ]);

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">4.8</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= 4.8 ? 'text-yellow-400' : 'text-gray-200'}`}
                  fill="currentColor"
                />
              ))}
            </div>
            <div className="text-sm text-gray-500 mt-1">Based on 24 reviews</div>
          </div>

          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2 mb-1">
                <div className="text-sm text-gray-600 w-3">{rating}</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${rating === 5 ? '70%' : rating === 4 ? '20%' : '10%'}` }}
                  />
                </div>
                <div className="text-sm text-gray-500 w-8">
                  {rating === 5 ? '70%' : rating === 4 ? '20%' : '10%'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{review.clientName}</h3>
                <p className="text-sm text-gray-500">{review.jobTitle}</p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                    fill="currentColor"
                  />
                ))}
              </div>
            </div>

            <p className="mt-3 text-gray-600">{review.comment}</p>

            {review.response && (
              <div className="mt-4 pl-4 border-l-2 border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Your response: </span>
                  {review.response}
                </p>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 hover:text-gray-900">
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpful})</span>
                </button>
                {!review.response && (
                  <button className="hover:text-gray-900">
                    Reply
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{review.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
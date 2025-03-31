import HowItWorks from '@/components/sections/HowItWorks';
import TrustBanner from '@/components/sections/TrustBanner';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">How UpTravail Works</h1>
            <p className="text-gray-900 text-lg">
              Get your projects done with our simple and efficient process
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Trust Banner */}
      <TrustBanner />

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Ready to Get Started?
          </h2>
          <p className="text-white mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found the perfect professionals for their projects
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/auth/register" 
              className="bg-white text-gray-900 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              Sign Up Now
            </a>
            <a 
              href="/browse-services" 
              className="bg-primary-dark text-white px-8 py-3 rounded-full font-medium hover:bg-primary-dark/90 transition-colors"
            >
              Browse Services
            </a>
          </div>
        </div>
      </section>
    </div>
  );
} 
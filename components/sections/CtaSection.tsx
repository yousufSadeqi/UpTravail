import Link from 'next/link';

export default function CtaSection() {
  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-xl mb-8">Join thousands of clients and professionals on our platform</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register?type=client"
            className="bg-white text-primary px-8 py-4 rounded-lg hover:bg-gray-100 transition"
          >
            Hire a Professional
          </Link>
          <Link
            href="/auth/register?type=professional"
            className="bg-accent text-white px-8 py-4 rounded-lg hover:bg-accent/90 transition"
          >
            Become a Professional
          </Link>
        </div>
      </div>
    </section>
  );
} 
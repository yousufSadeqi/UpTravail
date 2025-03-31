import Link from 'next/link';

interface CategoryProps {
  name: string;
  icon: string;
  slug: string;
  count: number;
}

const categories: CategoryProps[] = [
  { name: 'Plumbing', icon: '🔧', slug: 'plumbing', count: 450 },
  { name: 'Electrical', icon: '⚡', slug: 'electrical', count: 380 },
  { name: 'Construction', icon: '🏗️', slug: 'construction', count: 290 },
  { name: 'Painting', icon: '🎨', slug: 'painting', count: 320 },
  { name: 'Carpentry', icon: '🪚', slug: 'carpentry', count: 250 },
  { name: 'Cleaning', icon: '🧹', slug: 'cleaning', count: 410 },
  { name: 'Landscaping', icon: '🌳', slug: 'landscaping', count: 180 },
  { name: 'Moving', icon: '📦', slug: 'moving', count: 150 },
];

export default function Categories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-black">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.slug} {...category} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ name, icon, slug, count }: CategoryProps) {
  return (
    <Link
      href={`/categories/${slug}`}
      className="group p-4 bg-white rounded-lg border hover:border-primary transition"
    >
      <div className="text-3xl mb-2 ">{icon}</div>
      <h3 className="font-semibold group-hover:text-primary text-black">
        {name}
      </h3>
      <p className="text-sm text-gray-600">{count} professionals</p>
    </Link>
  );
} 
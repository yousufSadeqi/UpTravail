import Image from 'next/image';

interface ProfessionalProps {
  name: string;
  title: string;
  rating: number;
  jobsCompleted: number;
  image: string;
}

const professionals: ProfessionalProps[] = [
  {
    name: "John Smith",
    title: "Master Plumber",
    rating: 4.9,
    jobsCompleted: 124,
    image: "/professionals/john.jpg"
  },
  {
    name: "Sarah Johnson",
    title: "Electrical Expert",
    rating: 4.8,
    jobsCompleted: 98,
    image: "/professionals/sarah.jpg"
  },
  {
    name: "Mike Brown",
    title: "Construction Specialist",
    rating: 4.7,
    jobsCompleted: 156,
    image: "/professionals/mike.jpg"
  }
];

export default function FeaturedProfessionals() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Top Rated Professionals</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((professional) => (
            <ProfessionalCard key={professional.name} {...professional} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProfessionalCard({ name, title, rating, jobsCompleted, image }: ProfessionalProps) {
  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition">
      <div className="flex items-center gap-4 mb-4">
        <Image
          src={image}
          alt={name}
          width={60}
          height={60}
          className="rounded-full"
        />
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-gray-600">{title}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span>⭐</span>
          <span>{rating}</span>
        </div>
        <div>{jobsCompleted} jobs completed</div>
      </div>
    </div>
  );
} 
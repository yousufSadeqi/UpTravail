import { Star, Shield, Briefcase } from 'lucide-react';

export default function TrustBanner() {
  return (
    <section className="bg-gray-50 py-6 border-b">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TrustItem
            icon={<Star className="w-6 h-6 text-primary" />}
            title="Proven Professionals"
            description="Hand-vetted professionals"
          />
          <TrustItem
            icon={<Shield className="w-6 h-6 text-primary" />}
            title="Safe & Secure"
            description="Protected payments, every time"
          />
          <TrustItem
            icon={<Briefcase className="w-6 h-6 text-primary" />}
            title="Get Work Done"
            description="Your satisfaction guaranteed"
          />
        </div>
      </div>
    </section>
  );
}

function TrustItem({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
} 
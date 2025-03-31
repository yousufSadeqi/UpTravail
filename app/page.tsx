import HeroSection from '@/components/sections/HeroSection';
import TrustBanner from '@/components/sections/TrustBanner';
import PopularServices from '@/components/sections/PopularServices';
import Categories from '@/components/sections/Categories';
import HowItWorks from '@/components/sections/HowItWorks';
import FeaturedProfessionals from '@/components/sections/FeaturedProfessionals';
import ClientReviews from '@/components/sections/ClientReviews';
import CtaSection from '@/components/sections/CtaSection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <TrustBanner />
      <PopularServices />
      <Categories />
      <HowItWorks />
      <FeaturedProfessionals />
      <ClientReviews />
      <CtaSection />
    </div>
  );
}

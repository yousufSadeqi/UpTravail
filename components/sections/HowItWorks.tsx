import { Search, FileCheck, Briefcase, Star } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: "Search Services",
    description: "Browse through our extensive list of qualified professionals and services",
    color: "bg-blue-500",
    number: "01"
  },
  {
    icon: FileCheck,
    title: "Compare & Choose",
    description: "Read reviews, compare prices, and select the best professional for your needs",
    color: "bg-green-500",
    number: "02"
  },
  {
    icon: Briefcase,
    title: "Hire & Work",
    description: "Communicate directly, set project details, and get the work done",
    color: "bg-purple-500",
    number: "03"
  },
  {
    icon: Star,
    title: "Review & Rate",
    description: "Share your experience and help others make informed decisions",
    color: "bg-orange-500",
    number: "04"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4 text-black">How UpTravail Works</h2>
          <p className="text-gray-600">
            Get your project done in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/4 left-full w-full h-[2px] bg-gray-200 -translate-y-1/2">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              )}

              {/* Step Content */}
              <div className="bg-white rounded-xl p-6 shadow-lg group-hover:shadow-xl transition-shadow">
                {/* Number Badge */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 ${step.color} rounded-lg flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-7 h-7" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Hover Indicator */}
                <div className="absolute bottom-0 left-0 h-1 w-full bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <button className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary-dark transition-colors inline-flex items-center gap-2">
            Get Started Now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
} 
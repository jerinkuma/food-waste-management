import {
  UtensilsCrossed,
  ClipboardCheck,
  Truck,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: <UtensilsCrossed size={40} />,
    title: "Food Donation",
    desc: "Restaurants, hotels and households donate surplus food through FeedLink.",
  },
  {
    icon: <ClipboardCheck size={40} />,
    title: "Verification",
    desc: "Food quality and pickup time are verified before approval.",
  },
  {
    icon: <Truck size={40} />,
    title: "NGO Pickup",
    desc: "NGOs or volunteers receive and collect the donated food.",
  },
  {
    icon: <HeartHandshake size={40} />,
    title: "Food Delivery",
    desc: "Fresh food reaches people in need quickly and safely.",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="bg-green-50 py-16 md:py-24 px-5 md:px-6"
    >
      <div className="max-w-7xl mx-auto">

        {/* Heading */}

        <div className="text-center mb-12 md:mb-16">

          <p className="uppercase tracking-[4px] text-green-600 font-semibold">
            Process
          </p>

          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mt-4">
            How FeedLink Works
          </h2>

          <p className="mt-5 text-gray-600 max-w-2xl mx-auto leading-7">
            FeedLink connects food donors, NGOs and volunteers through
            a simple four-step process to reduce food waste.
          </p>

        </div>

        {/* Cards */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">

          {steps.map((step, index) => (

            <div
              key={index}
              className="relative bg-white rounded-3xl p-6 md:p-8 shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            >

              {/* Step Number */}

              <span className="absolute top-4 right-4 text-4xl md:text-5xl font-bold text-green-100">
                0{index + 1}
              </span>

              {/* Icon */}

              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-6">
                {step.icon}
              </div>

              {/* Title */}

              <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                {step.title}
              </h3>

              {/* Description */}

              <p className="mt-4 text-gray-600 leading-7 text-sm md:text-base">
                {step.desc}
              </p>

              {/* Desktop Arrow */}

              {index !== steps.length - 1 && (
                <ArrowRight
                  size={30}
                  className="hidden lg:block absolute -right-5 top-1/2 -translate-y-1/2 text-green-400"
                />
              )}

            </div>

          ))}

        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
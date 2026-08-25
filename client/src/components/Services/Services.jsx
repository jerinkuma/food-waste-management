import {
  Building2,
  Home,
  HandHelping,
  Truck,
  Users,
  BarChart3,
} from "lucide-react";

const services = [
  {
    icon: <Building2 size={40} />,
    title: "Restaurants & Hotels",
    desc: "Donate surplus food safely instead of wasting it.",
  },
  {
    icon: <Home size={40} />,
    title: "Households",
    desc: "Share extra homemade food with nearby communities.",
  },
  {
    icon: <HandHelping size={40} />,
    title: "NGOs",
    desc: "Receive food requests and manage distributions.",
  },
  {
    icon: <Truck size={40} />,
    title: "Volunteers",
    desc: "Collect and deliver food to those in need.",
  },
  {
    icon: <Users size={40} />,
    title: "Receivers",
    desc: "Get fresh and safe food through trusted organizations.",
  },
  {
    icon: <BarChart3 size={40} />,
    title: "Analytics",
    desc: "Track donations, deliveries and overall impact.",
  },
];

const Services = () => {
  return (
    <section
      id="services"
      className="bg-white py-16 md:py-24 px-5 md:px-6"
    >
      <div className="max-w-7xl mx-auto">

        {/* Heading */}

        <div className="text-center mb-14">

          <p className="uppercase tracking-[4px] text-green-600 font-semibold">
            Our Services
          </p>

          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mt-4">
            Who Can Use FeedLink?
          </h2>

          <p className="mt-5 text-gray-600 max-w-2xl mx-auto">
            FeedLink connects every participant involved in reducing food
            waste through one smart platform.
          </p>

        </div>

        {/* Cards */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {services.map((service, index) => (

            <div
              key={index}
              className="rounded-3xl border border-gray-100 bg-white p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >

              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-6">
                {service.icon}
              </div>

              <h3 className="text-2xl font-bold text-gray-800">
                {service.title}
              </h3>

              <p className="mt-4 text-gray-600 leading-7">
                {service.desc}
              </p>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
};

export default Services;
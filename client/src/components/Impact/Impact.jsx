
import { useEffect, useState } from "react";

import {
  HandPlatter,
  HeartHandshake,
  Store,
  Building2,
  ArrowUpRight,
  Leaf,
} from "lucide-react";

const statsConfig = [
  {
    key: "totalDonations",
    icon: HandPlatter,
    title: "Food Donations",
    description: "Total donations shared",
  },
  {
    key: "successfulDonations",
    icon: HeartHandshake,
    title: "Successful Donations",
    description: "Donations completed",
  },
  {
    key: "totalRestaurants",
    icon: Store,
    title: "Restaurant Partners",
    description: "Restaurants contributing",
  },
  {
    key: "totalNgos",
    icon: Building2,
    title: "NGO Partners",
    description: "Organizations connected",
  },
];

const Impact = () => {
  const [stats, setStats] = useState({
    totalDonations: null,
    successfulDonations: null,
    totalRestaurants: null,
    totalNgos: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpactStats = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/donations/impact-stats"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch impact statistics");
        }

        const result = await response.json();

        if (result.success && result.data) {
          setStats(result.data);
        }
      } catch (error) {
        console.error("Impact Statistics Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImpactStats();
  }, []);

  return (
    <section
      id="impact"
      className="bg-green-50 px-6 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-14 text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-4 py-2 text-sm font-semibold text-green-700">
            <Leaf size={16} />
            FEEDLINK IMPACT
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 sm:text-4xl lg:text-5xl">
            Our <span className="text-green-600">Impact</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
            Together, we're building a world where good food
            finds the people who need it. Every contribution
            brings us one step closer to reducing food waste.
          </p>

        </div>

        {/* Statistics */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {statsConfig.map((item) => {
            const Icon = item.icon;
            const value = stats[item.key];

            return (
              <div
                key={item.key}
                className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-green-200 hover:shadow-2xl"
              >

                {/* Top Accent */}
                <div className="absolute left-0 top-0 h-1 w-0 bg-green-600 transition-all duration-500 group-hover:w-full" />

                {/* Icon */}
                <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-600 transition-all duration-300 group-hover:bg-green-600 group-hover:text-white">
                  <Icon size={28} strokeWidth={1.8} />
                </div>

                {/* Number */}
                <h3 className="text-4xl font-extrabold tracking-tight text-gray-800 sm:text-5xl">
                  {loading
                    ? "..."
                    : value !== null && value !== undefined
                    ? Number(value).toLocaleString()
                    : "—"}
                </h3>

                {/* Title */}
                <p className="mt-4 text-base font-semibold text-gray-800">
                  {item.title}
                </p>

                {/* Description */}
                <p className="mt-2 text-sm text-gray-600">
                  {item.description}
                </p>

                {/* Arrow */}
                <div className="absolute bottom-7 right-7 text-gray-200 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-green-500">
                  <ArrowUpRight size={21} />
                </div>

              </div>
            );
          })}

        </div>

        {/* Bottom Message */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 border-t border-green-100 pt-8 text-center sm:flex-row">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-green-600">
            <Leaf size={18} />
          </div>

          <p className="text-sm text-gray-600">
            Every donation matters. Every meal makes a difference.
          </p>

        </div>

      </div>
    </section>
  );
};

export default Impact;

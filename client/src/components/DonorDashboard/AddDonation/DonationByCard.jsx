import { BadgeCheck, Store } from "lucide-react";

const DonationByCard = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <h2 className="mb-5 text-xl font-bold text-gray-900">
        Donation By
      </h2>

      <div className="flex items-center gap-4">

        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <Store size={28} className="text-green-700" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Cafe One
          </h3>

          <div className="mt-1 flex items-center gap-2 text-green-600">
            <BadgeCheck size={18} />
            <span className="text-sm font-medium">
              Verified Restaurant
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DonationByCard;
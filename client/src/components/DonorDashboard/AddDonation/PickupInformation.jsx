import {
  MapPin,
  Calendar,
  Clock,
  Phone,
  FileText,
} from "lucide-react";

const PickupInformation = () => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

      {/* Header */}

      <div className="mb-8">

        <h2 className="text-2xl font-bold text-gray-800">
          Pickup Information
        </h2>

        <p className="mt-2 text-gray-500">
          Provide pickup location and preferred schedule.
        </p>

      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* Pickup Address */}

        <div className="md:col-span-2">

          <label className="mb-2 flex items-center gap-2 font-medium text-gray-700">

            <MapPin size={18} />

            Pickup Address

          </label>

          <textarea
            rows="3"
            placeholder="Enter pickup address..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none resize-none transition focus:border-green-500"
          />

        </div>

        {/* Pickup Date */}

        <div>

          <label className="mb-2 flex items-center gap-2 font-medium text-gray-700">

            <Calendar size={18} />

            Pickup Date

          </label>

          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
          />

        </div>

        {/* Pickup Time */}

        <div>

          <label className="mb-2 flex items-center gap-2 font-medium text-gray-700">

            <Clock size={18} />

            Pickup Time

          </label>

          <input
            type="time"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
          />

        </div>

        {/* Contact Number */}

        <div>

          <label className="mb-2 flex items-center gap-2 font-medium text-gray-700">

            <Phone size={18} />

            Contact Number

          </label>

          <input
            type="text"
            placeholder="+8801XXXXXXXXX"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
          />

        </div>

        {/* Estimated Pickup Duration */}

        <div>

          <label className="mb-2 font-medium text-gray-700">
            Estimated Pickup Duration
          </label>

          <select className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500">

            <option>15 Minutes</option>
            <option>30 Minutes</option>
            <option>45 Minutes</option>
            <option>1 Hour</option>
            <option>2 Hours</option>

          </select>

        </div>

      </div>

      {/* Special Instructions */}

      <div className="mt-6">

        <label className="mb-2 flex items-center gap-2 font-medium text-gray-700">

          <FileText size={18} />

          Special Instructions

        </label>

        <textarea
          rows="4"
          placeholder="Write any instructions for the NGO or volunteer..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none resize-none transition focus:border-green-500"
        />

      </div>

    </div>
  );
};

export default PickupInformation;
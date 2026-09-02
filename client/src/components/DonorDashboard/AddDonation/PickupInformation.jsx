
import {
  MapPin,
  Calendar,
  Clock,
  Phone,
  FileText,
} from "lucide-react";

const PickupInformation = ({
  donationData,
  updateDonationData,
}) => {
  const handleChange = (field, value) => {
    updateDonationData(field, value);
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
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
            value={donationData.pickupAddress}
            onChange={(e) =>
              handleChange("pickupAddress", e.target.value)
            }
            placeholder="Enter pickup address..."
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
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
            value={donationData.pickupDate}
            onChange={(e) =>
              handleChange("pickupDate", e.target.value)
            }
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
            value={donationData.pickupTime}
            onChange={(e) =>
              handleChange("pickupTime", e.target.value)
            }
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
            value={donationData.contactNumber}
            onChange={(e) =>
              handleChange("contactNumber", e.target.value)
            }
            placeholder="+8801XXXXXXXXX"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
          />
        </div>

        {/* Pickup Duration */}
        <div>
          <label className="mb-2 font-medium text-gray-700">
            Estimated Pickup Duration
          </label>

          <select
            value={donationData.pickupDuration}
            onChange={(e) =>
              handleChange("pickupDuration", e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
          >
            <option value="15 Minutes">15 Minutes</option>
            <option value="30 Minutes">30 Minutes</option>
            <option value="45 Minutes">45 Minutes</option>
            <option value="1 Hour">1 Hour</option>
            <option value="2 Hours">2 Hours</option>
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
          value={donationData.specialInstructions}
          onChange={(e) =>
            handleChange(
              "specialInstructions",
              e.target.value
            )
          }
          placeholder="Write any instructions for the NGO or volunteer..."
          className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
        />
      </div>
    </div>
  );
};

export default PickupInformation;


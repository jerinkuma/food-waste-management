
import { ShieldCheck } from "lucide-react";

const SafetyDeclaration = ({
  donationData,
  updateDonationData,
}) => {
  const handleSafetyChange = (e) => {
    updateDonationData("safetyConfirmed", e.target.checked);
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100">
          <ShieldCheck
            size={23}
            className="text-green-600"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Safety Declaration
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Please confirm the food is safe before publishing.
          </p>
        </div>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-green-300 hover:bg-green-50">
        <input
          type="checkbox"
          checked={donationData.safetyConfirmed}
          onChange={handleSafetyChange}
          className="mt-1 h-5 w-5 shrink-0 accent-green-600"
        />

        <div>
          <p className="text-sm font-semibold text-gray-800">
            I confirm that the donated food is safe for
            consumption and all information provided is accurate.
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            The food will be checked by an authorised NGO or
            volunteer during pickup.
          </p>
        </div>
      </label>

    </div>
  );
};

export default SafetyDeclaration;


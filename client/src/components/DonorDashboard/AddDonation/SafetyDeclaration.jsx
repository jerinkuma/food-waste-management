import { ShieldCheck } from "lucide-react";

const SafetyDeclaration = () => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

      {/* Header */}

      <div className="flex items-center gap-3">

        <div className="rounded-2xl bg-green-100 p-3">

          <ShieldCheck
            size={28}
            className="text-green-600"
          />

        </div>

        <div>

          <h2 className="text-2xl font-bold text-gray-800">
            Safety Declaration
          </h2>

          <p className="mt-1 text-gray-500">
            Please confirm the following before publishing the donation.
          </p>

        </div>

      </div>

      {/* Checklist */}

      <div className="mt-8 space-y-5">

        <label className="flex items-start gap-3">

          <input type="checkbox" className="mt-1 h-5 w-5 accent-green-600" />

          <span className="text-gray-700">
            The food was prepared in a hygienic environment.
          </span>

        </label>

        <label className="flex items-start gap-3">

          <input type="checkbox" className="mt-1 h-5 w-5 accent-green-600" />

          <span className="text-gray-700">
            The food has been stored at a safe temperature.
          </span>

        </label>

        <label className="flex items-start gap-3">

          <input type="checkbox" className="mt-1 h-5 w-5 accent-green-600" />

          <span className="text-gray-700">
            The food is within its safe consumption period.
          </span>

        </label>

        <label className="flex items-start gap-3">

          <input type="checkbox" className="mt-1 h-5 w-5 accent-green-600" />

          <span className="text-gray-700">
            The information provided is accurate.
          </span>

        </label>

        <label className="flex items-start gap-3">

          <input type="checkbox" className="mt-1 h-5 w-5 accent-green-600" />

          <span className="text-gray-700">
            I understand that the NGO/Volunteer will verify the food before pickup.
          </span>

        </label>

      </div>

      {/* Notice */}

      <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">

        <p className="text-sm leading-7 text-yellow-800">

          <strong>Note:</strong> Submitting this declaration does not automatically
          approve the food. The donated food will be inspected by an authorised
          NGO or volunteer during pickup using the FeedLink verification process.

        </p>

      </div>

    </div>
  );
};

export default SafetyDeclaration;
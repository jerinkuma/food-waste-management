import {
  Mail,
  ShieldCheck,
  CalendarDays,
  Clock3,
} from "lucide-react";

const AccountInfo = () => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Account Information
      </h2>

      <div className="space-y-6">

        {/* Email */}

        <div className="flex items-start gap-4">

          <div className="rounded-xl bg-green-100 p-3">
            <Mail
              size={22}
              className="text-green-700"
            />
          </div>

          <div>

            <p className="text-sm text-gray-500">
              Email Address
            </p>

            <h3 className="text-lg font-semibold text-gray-900">
              greenleaf@gmail.com
            </h3>

          </div>

        </div>

        {/* Account Type */}

        <div className="flex items-start gap-4">

          <div className="rounded-xl bg-blue-100 p-3">
            <ShieldCheck
              size={22}
              className="text-blue-700"
            />
          </div>

          <div>

            <p className="text-sm text-gray-500">
              Account Type
            </p>

            <h3 className="text-lg font-semibold text-gray-900">
              Restaurant Donor
            </h3>

          </div>

        </div>

        {/* Joined */}

        <div className="flex items-start gap-4">

          <div className="rounded-xl bg-purple-100 p-3">
            <CalendarDays
              size={22}
              className="text-purple-700"
            />
          </div>

          <div>

            <p className="text-sm text-gray-500">
              Joined On
            </p>

            <h3 className="text-lg font-semibold text-gray-900">
              15 July 2026
            </h3>

          </div>

        </div>

        {/* Last Login */}

        <div className="flex items-start gap-4">

          <div className="rounded-xl bg-yellow-100 p-3">
            <Clock3
              size={22}
              className="text-yellow-700"
            />
          </div>

          <div>

            <p className="text-sm text-gray-500">
              Last Login
            </p>

            <h3 className="text-lg font-semibold text-gray-900">
              Today, 10:45 AM
            </h3>

          </div>

        </div>

      </div>

      <button className="mt-8 w-full rounded-xl bg-green-600 py-3 text-lg font-semibold text-white transition duration-300 hover:bg-green-700">
        Change Password
      </button>

    </div>
  );
};

export default AccountInfo;
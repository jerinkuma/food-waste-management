import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  BadgeCheck,
  Warehouse,
} from "lucide-react";

const SignupForm = ({ setIsSignup }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState("");

  return (
    <div className="w-full max-w-xl p-6">

      {/* Logo */}

      <h1 className="text-center text-4xl font-extrabold tracking-tight text-gray-900">
        Feed<span className="text-green-600">Link</span>
      </h1>

      <p className="mt-2 text-center font-medium text-gray-700">
        Create Your Account
      </p>

      {/* Full Name */}

      <div className="relative mt-5">

        <User
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />

        <input
          type="text"
          placeholder="Full Name"
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 outline-none transition focus:border-green-500"
        />

      </div>

      {/* Email */}

      <div className="relative mt-4">

        <Mail
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />

        <input
          type="email"
          placeholder="Email Address"
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 outline-none transition focus:border-green-500"
        />

      </div>

      {/* Role */}

      <div className="mt-4">

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 outline-none transition focus:border-green-500"
        >

          <option value="">
            Select Role
          </option>

          <option value="donor">
            Food Donor / Restaurant
          </option>

          <option value="ngo">
            NGO
          </option>

        </select>

      </div>
            {/* NGO Fields */}
      {role === "ngo" && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">

          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            NGO Information
          </h3>

          <div className="space-y-3">

            {/* Organization ID */}

            <div className="relative">

              <BadgeCheck
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                placeholder="Organization ID Number"
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 outline-none transition focus:border-green-500"
              />

            </div>

            {/* Maximum Capacity */}

            <div className="relative">

              <Warehouse
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="number"
                placeholder="Maximum Food Capacity"
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 outline-none transition focus:border-green-500"
              />

            </div>

            {/* Phone */}

            <div className="relative">

              <Phone
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                placeholder="Phone Number"
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 outline-none transition focus:border-green-500"
              />

            </div>

            {/* Address */}

            <div className="relative">

              <MapPin
                size={20}
                className="absolute left-4 top-4 text-gray-500"
              />

              <textarea
                rows="2"
                placeholder="Address"
                className="w-full resize-none rounded-xl border border-gray-300 bg-white p-3 pl-12 text-gray-900 placeholder-gray-500 outline-none transition focus:border-green-500"
              />

            </div>

          </div>

        </div>
      )}

      {/* Donor Fields */}

      {role === "donor" && (

        <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">

          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            Food Donor Information
          </h3>

          <div className="space-y-3">

            {/* Trade License */}

            <div className="relative">

              <BadgeCheck
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                placeholder="Trade License Number"
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 outline-none transition focus:border-green-500"
              />

            </div>

            {/* Phone */}

            <div className="relative">

              <Phone
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                placeholder="Phone Number"
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 outline-none transition focus:border-green-500"
              />

            </div>

            {/* Address */}

            <div className="relative">

              <MapPin
                size={20}
                className="absolute left-4 top-4 text-gray-500"
              />

              <textarea
                rows="2"
                placeholder="Address"
                className="w-full resize-none rounded-xl border border-gray-300 bg-white p-3 pl-12 text-gray-900 placeholder-gray-500 outline-none transition focus:border-green-500"
              />

            </div>

          </div>

        </div>

      )}
            {/* Password */}

      <div className="mt-4 relative">

        <Lock
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-12 text-gray-900 placeholder-gray-500 outline-none transition focus:border-green-500"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>

      </div>

      {/* Confirm Password */}

      <div className="mt-4 relative">

        <Lock
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />

        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm Password"
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-12 text-gray-900 placeholder-gray-500 outline-none transition focus:border-green-500"
        />

        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
        >
          {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>

      </div>

      {/* Create Button */}

      <button className="mt-5 w-full rounded-xl bg-green-600 py-3 text-lg font-semibold text-white transition duration-300 hover:bg-green-700 hover:scale-[1.02]">
        Create Account
      </button>

      {/* Divider */}

      <div className="my-5 flex items-center">

        <div className="h-px flex-1 bg-gray-300"></div>

        <span className="mx-4 text-sm font-medium text-gray-600">
          OR
        </span>

        <div className="h-px flex-1 bg-gray-300"></div>

      </div>

      {/* Login Link */}

      <p className="text-center text-gray-700">

        Already have an account?

        <button
          onClick={() => setIsSignup(false)}
          className="ml-2 font-semibold text-green-700 transition hover:text-green-800"
        >
          Login
        </button>

      </p>

    </div>
  );
};

export default SignupForm;
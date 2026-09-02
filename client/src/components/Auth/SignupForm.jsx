
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    organizationId: "",
    maximumCapacity: "",
    tradeLicense: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setMessage("");
    setMessageType("");

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      setMessage("Please fill in all required fields");
      setMessageType("error");
      return;
    }

    // Password match check
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return;
    }

    // NGO validation
    if (formData.role === "ngo") {
      if (
        !formData.organizationId ||
        !formData.maximumCapacity ||
        !formData.phone ||
        !formData.address
      ) {
        setMessage("Please fill in all NGO information");
        setMessageType("error");
        return;
      }
    }

    // Donor validation
    if (formData.role === "donor") {
      if (
        !formData.tradeLicense ||
        !formData.phone ||
        !formData.address
      ) {
        setMessage("Please fill in all donor information");
        setMessageType("error");
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            organizationId: formData.organizationId,
            maximumCapacity: Number(formData.maximumCapacity),
            tradeLicense: formData.tradeLicense,
            phone: formData.phone,
            address: formData.address,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Signup failed");
        setMessageType("error");
        return;
      }

      setMessage("Account created successfully!");
      setMessageType("success");

      console.log("User created:", data);

      // Clear form after successful signup
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        organizationId: "",
        maximumCapacity: "",
        tradeLicense: "",
        phone: "",
        address: "",
      });

    } catch (error) {
      console.error("Signup error:", error);

      setMessage("Unable to connect to server");
      setMessageType("error");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-3 sm:p-6">

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
          name="name"
          value={formData.name}
          onChange={handleChange}
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
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address"
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 outline-none transition focus:border-green-500"
        />

      </div>


      {/* Role */}

      <div className="mt-4">

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-500"
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

      {formData.role === "ngo" && (

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
                name="organizationId"
                value={formData.organizationId}
                onChange={handleChange}
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
                name="maximumCapacity"
                value={formData.maximumCapacity}
                onChange={handleChange}
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
                name="phone"
                value={formData.phone}
                onChange={handleChange}
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
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full resize-none rounded-xl border border-gray-300 bg-white p-3 pl-12 text-gray-900 placeholder-gray-500 outline-none transition focus:border-green-500"
              />

            </div>

          </div>

        </div>

      )}


      {/* Donor Fields */}

      {formData.role === "donor" && (

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
                name="tradeLicense"
                value={formData.tradeLicense}
                onChange={handleChange}
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
                name="phone"
                value={formData.phone}
                onChange={handleChange}
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
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full resize-none rounded-xl border border-gray-300 bg-white p-3 pl-12 text-gray-900 placeholder-gray-500 outline-none transition focus:border-green-500"
              />

            </div>

          </div>

        </div>

      )}


      {/* Password */}

      <div className="relative mt-4">

        <Lock
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />

        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
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

      <div className="relative mt-4">

        <Lock
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />

        <input
          type={showConfirm ? "text" : "password"}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
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


      {/* Message */}

      {message && (
        <p
          className={`mt-4 text-center text-sm font-medium ${
            messageType === "success"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}


      {/* Create Button */}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="mt-5 w-full rounded-xl bg-green-600 py-3 text-lg font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating Account..." : "Create Account"}
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
          type="button"
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


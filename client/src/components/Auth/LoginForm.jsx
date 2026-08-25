import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ setIsSignup }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Navigation
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-xl rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-6">

      {/* Logo */}
      <h1 className="text-4xl font-extrabold tracking-tight text-center text-gray-900">
        Feed<span className="text-green-600">Link</span>
      </h1>

      <p className="mt-2 text-center text-gray-700 font-medium">
        Welcome Back 👋
      </p>

      {/* Email */}
      <div className="mt-5 relative">
        <Mail
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="email"
          placeholder="Email Address"
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 outline-none focus:border-green-500"
        />
      </div>

      {/* Password */}
      <div className="mt-4 relative">
        <Lock
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-12 text-gray-900 placeholder-gray-500 outline-none focus:border-green-500"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Forgot Password */}
      <div className="mt-3 text-right">
        <button className="text-sm font-medium text-green-700 hover:text-green-800">
          Forgot Password?
        </button>
      </div>

      {/* Login Button */}
      <button
  onClick={() => navigate("/restaurant/dashboard")}
  className="mt-5 w-full rounded-xl bg-green-600 py-3 text-lg font-semibold text-white transition hover:bg-green-700"
>
  Login
</button>

      {/* Divider */}
      <div className="my-5 flex items-center">
        <div className="h-px flex-1 bg-gray-300"></div>

        <span className="mx-4 text-sm font-medium text-gray-600">
          OR
        </span>

        <div className="h-px flex-1 bg-gray-300"></div>
      </div>

      {/* Signup Link */}
      <p className="text-center text-gray-700">
        Don't have an account?

        <button
          onClick={() => setIsSignup(true)}
          className="ml-2 font-semibold text-green-700 hover:text-green-800"
        >
          Sign Up
        </button>
      </p>

    </div>
  );
};

export default LoginForm;
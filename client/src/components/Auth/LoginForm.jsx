import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ setIsSignup }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!email || !password) {
      setMessage("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "ngo") {
        navigate("/ngo/dashboard");
      } else if (data.user.role === "donor") {
        navigate("/restaurant/dashboard");
      } else {
        setMessage("Invalid user role");
      }

    } catch (error) {
      console.error("Login error:", error);
      setMessage("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6">

      {/* Logo */}
      <h1 className="text-center text-4xl font-extrabold tracking-tight text-gray-900">
        Feed<span className="text-green-600">Link</span>
      </h1>

      <p className="mt-2 text-center font-medium text-gray-700">
        Welcome Back 👋
      </p>

      {/* Form */}
      <form
        onSubmit={handleLogin}
        className="w-full mx-auto"
      >

        {/* Email */}
        <div className="relative mt-5 text-left">
          <Mail
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 outline-none focus:border-green-500"
          />
        </div>

        {/* Password */}
        <div className="relative mt-4 text-left">
          <Lock
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <button
            type="button"
            className="text-sm font-medium text-green-700 hover:text-green-800"
          >
            Forgot Password?
          </button>
        </div>

        {/* Error Message */}
        {message && (
          <p className="mt-3 text-center text-sm text-red-600">
            {message}
          </p>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-green-600 py-3 text-lg font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

      {/* Divider */}
      <div className="my-5 flex w-full items-center">
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
          type="button"
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
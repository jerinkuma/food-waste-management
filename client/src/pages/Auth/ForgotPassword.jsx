import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      setMessage(data.message);
      setEmail("");
    } catch (err) {
      console.error("Forgot Password Error:", err);
      setError("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F3D2E] via-[#14532d] to-[#22c55e] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Feed<span className="text-green-600">Link</span>
          </h1>

          <h2 className="mt-6 text-2xl font-bold text-gray-800">
            Forgot Password?
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Enter your registered email address. We'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Mail
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-gray-900 outline-none focus:border-green-500"
              required
            />
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-4 rounded-lg bg-green-50 p-3 text-center text-sm text-green-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <Link
          to="/auth"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
        >
          <ArrowLeft size={17} />
          Back to Login
        </Link>

      </div>
    </div>
  );
};

export default ForgotPassword;
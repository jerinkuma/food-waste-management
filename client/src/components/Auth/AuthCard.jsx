import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const AuthCard = () => {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div className="w-full max-w-xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl">

      {/* Title */}
      <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
        {isSignup ? "Signup Form" : "Login Form"}
      </h1>

      {/* Slider Tabs */}
      <div className="relative mb-6 grid grid-cols-2 rounded-xl border border-gray-200 bg-gray-100 p-1">

        {/* Sliding Background */}
        <motion.div
          className="absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-green-600 shadow-md"
          animate={{
            x: isSignup ? "100%" : "0%",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 28,
          }}
        />

        {/* Login Button */}
        <button
          onClick={() => setIsSignup(false)}
          className={`relative z-10 rounded-lg py-3 font-semibold transition ${
            !isSignup
              ? "text-white"
              : "text-gray-600"
          }`}
        >
          Login
        </button>

        {/* Signup Button */}
        <button
          onClick={() => setIsSignup(true)}
          className={`relative z-10 rounded-lg py-3 font-semibold transition ${
            isSignup
              ? "text-white"
              : "text-gray-600"
          }`}
        >
          Signup
        </button>

      </div>

      {/* Forms */}
      <AnimatePresence mode="wait">
        {!isSignup ? (
          <motion.div
            key="login"
            initial={{
              opacity: 0,
              x: -30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: 30,
            }}
            transition={{
              duration: 0.3,
            }}
          >
            <LoginForm setIsSignup={setIsSignup} />
          </motion.div>
        ) : (
          <motion.div
            key="signup"
            initial={{
              opacity: 0,
              x: 30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -30,
            }}
            transition={{
              duration: 0.3,
            }}
          >
            <SignupForm setIsSignup={setIsSignup} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AuthCard;
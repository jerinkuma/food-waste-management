import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import LeftContent from "./LeftContent";

const AuthCard = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [direction, setDirection] = useState(1);

  const goSignup = () => {
    setDirection(1);
    setIsSignup(true);
  };

  const goLogin = () => {
    setDirection(-1);
    setIsSignup(false);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.96,
    }),

    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },

    exit: (direction) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
      scale: 0.96,
    }),
  };

  return (
    <div className="relative w-full max-w-6xl h-[75vh] min-h-[620px] rounded-[40px] bg-white shadow-2xl overflow-hidden">

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={isSignup ? "signup" : "login"}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-0 grid grid-cols-2"
        >

          {!isSignup ? (
            <>
              {/* Left Panel */}
              <LeftContent isSignup={false} />

              {/* Login Form */}
              <div className="bg-white p-10 overflow-y-auto">
                <div className="min-h-full flex items-center justify-center">
                  <LoginForm setIsSignup={goSignup} />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Signup Form */}
              <div className="bg-white p-6 overflow-y-auto">
                <div className="min-h-full flex items-center justify-center">
                  <SignupForm setIsSignup={goLogin} />
                </div>
              </div>

              {/* Right Panel */}
              <LeftContent isSignup={true} />
            </>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
};

export default AuthCard;
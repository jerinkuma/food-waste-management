import { useState } from "react";

import AuthNavbar from "../../components/Auth/AuthNavbar";
import AuthFooter from "../../components/Auth/AuthFooter";
import AuthCard from "../../components/Auth/AuthCard";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0F3D2E] via-[#14532d] to-[#22c55e]">

      {/* Navbar */}
      <AuthNavbar />

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-5">

        <AuthCard
          isSignup={isSignup}
          setIsSignup={setIsSignup}
        />

      </main>

      {/* Footer */}
      <AuthFooter />

    </div>
  );
};

export default Auth;

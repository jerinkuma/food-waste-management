import { Link } from "react-router-dom";

const AuthNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-[#0F3D2E]/80 backdrop-blur-md">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">

        <h1 className="text-3xl font-bold text-white cursor-default">
  Feed<span className="text-green-400">Link</span>
</h1>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-white hover:text-green-400 transition"
          >
            Home
          </Link>
        </div>

      </div>

    </nav>
  );
};

export default AuthNavbar;
import { Link } from "react-router-dom";

const AuthNavbar = () => {
  return (
    <nav className="w-full border-b border-white/10 bg-white/5 backdrop-blur-md">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">

        <Link
          to="/"
          className="text-3xl font-bold text-white"
        >
          Feed<span className="text-green-400">Link</span>
        </Link>

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
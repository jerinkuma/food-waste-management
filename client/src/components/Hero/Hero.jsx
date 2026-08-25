import heroImage from "../../assets/hero1.jpg";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${heroImage})`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Green Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 via-transparent to-green-900/20"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl px-6 text-center">

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-white">
          Reduce
          <span className="text-green-400"> Food Waste.</span>

          <br />

          Feed More
          <span className="text-green-400"> Lives.</span>
        </h1>

        <p className="mt-8 text-lg md:text-xl leading-9 text-gray-200 max-w-3xl mx-auto">
          FeedLink connects restaurants, hotels, households,
          NGOs and volunteers to reduce food waste and safely
          deliver surplus food to people who need it most.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-5">

          <button
            onClick={() => navigate("/auth")}
            className="px-8 py-4 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition duration-300"
          >
            Donate Food
          </button>

          <button
            onClick={() => navigate("/auth")}
            className="px-8 py-4 rounded-xl border-2 border-white text-white font-semibold hover:bg-white hover:text-black transition duration-300"
          >
            Request Food
          </button>

        </div>

      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-white animate-bounce">
        <ChevronDown size={36} />
      </div>

    </section>
  );
};

export default Hero;
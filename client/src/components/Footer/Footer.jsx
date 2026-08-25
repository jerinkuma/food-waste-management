import { Mail, Phone, MapPin } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer
      id="footer"
      className="bg-gray-900 text-white pt-16 pb-8"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Top */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Logo */}

          <div>

            <h2 className="text-3xl font-bold text-green-500">
              FeedLink
            </h2>

            <p className="mt-5 text-gray-400 leading-7">
              FeedLink is a smart food waste management platform that
              connects food donors, NGOs and volunteers to reduce
              hunger and minimize food waste.
            </p>

          </div>

          {/* Quick Links */}

          <div>

            <h3 className="text-xl font-semibold mb-5">
              Quick Links
            </h3>

            <ul className="space-y-3 text-gray-400">

              <li>
                <a href="#home" className="hover:text-green-400 transition">
                  Home
                </a>
              </li>

              <li>
                <a href="#about" className="hover:text-green-400 transition">
                  About
                </a>
              </li>

              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-green-400 transition"
                >
                  How It Works
                </a>
              </li>

              <li>
                <a
                  href="#services"
                  className="hover:text-green-400 transition"
                >
                  Services
                </a>
              </li>

              <li>
                <a
                  href="#contact"
                  className="hover:text-green-400 transition"
                >
                  Contact
                </a>
              </li>

            </ul>

          </div>

          {/* Contact */}

          <div>

            <h3 className="text-xl font-semibold mb-5">
              Contact
            </h3>

            <div className="space-y-4 text-gray-400">

              <div className="flex items-center gap-3">
                <MapPin size={18} />
                <span>Dhaka, Bangladesh</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} />
                <span>+880 1234-567890</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} />
                <span>contact@feedlink.com</span>
              </div>

            </div>

          </div>

          {/* Social */}

          <div>

            <h3 className="text-xl font-semibold mb-5">
              Follow Us
            </h3>

            <div className="flex gap-4">

              <a
                href="#"
                className="w-11 h-11 rounded-full bg-gray-800 hover:bg-green-600 transition flex items-center justify-center"
              >
                <FaFacebookF size={18} />
              </a>

              <a
                href="#"
                className="w-11 h-11 rounded-full bg-gray-800 hover:bg-green-600 transition flex items-center justify-center"
              >
                <FaInstagram size={18} />
              </a>

              <a
                href="#"
                className="w-11 h-11 rounded-full bg-gray-800 hover:bg-green-600 transition flex items-center justify-center"
              >
                <FaLinkedinIn size={18} />
              </a>

              <a
                href="#"
                className="w-11 h-11 rounded-full bg-gray-800 hover:bg-green-600 transition flex items-center justify-center"
              >
                <FaGithub size={18} />
              </a>

            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="border-t border-gray-700 mt-12 pt-6 text-center text-gray-500">

          © {new Date().getFullYear()} FeedLink. All Rights Reserved.

        </div>

      </div>
    </footer>
  );
};

export default Footer;
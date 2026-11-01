
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

        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* Logo & Description */}
          <div className="flex flex-col items-start">
            <h2 className="text-3xl font-bold text-green-500">
              FeedLink
            </h2>

            <p className="mt-5 text-gray-400 leading-7 max-w-sm">
              FeedLink is a smart food waste management platform that
              connects food donors, NGOs and volunteers to reduce
              hunger and minimize food waste.
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-start">
            <h3 className="text-xl font-semibold mb-6">
              Contact
            </h3>

            <div className="space-y-5 text-gray-400 w-full">

              <div className="flex items-start gap-3">
                <MapPin
                  size={19}
                  className="text-green-500 shrink-0 mt-1"
                />
                <span>Dhaka, Bangladesh</span>
              </div>

              <div className="flex items-start gap-3">
                <Phone
                  size={19}
                  className="text-green-500 shrink-0 mt-1"
                />
                <span>+880 1234-567890</span>
              </div>

              <div className="flex items-start gap-3">
                <Mail
                  size={19}
                  className="text-green-500 shrink-0 mt-1"
                />
                <span className="break-all">
                  feedlink.support@gmail.com
                </span>
              </div>

            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-start">
            <h3 className="text-xl font-semibold mb-6">
              Follow Us
            </h3>

            <p className="text-gray-400 mb-6 leading-7">
              Stay connected with FeedLink and be part of our mission
              to reduce food waste.
            </p>

            <div className="flex flex-wrap gap-4">

              <a
                href="#"
                aria-label="Facebook"
                className="w-11 h-11 rounded-full bg-gray-800 hover:bg-green-600 transition-all duration-300 flex items-center justify-center hover:-translate-y-1"
              >
                <FaFacebookF size={18} />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="w-11 h-11 rounded-full bg-gray-800 hover:bg-green-600 transition-all duration-300 flex items-center justify-center hover:-translate-y-1"
              >
                <FaInstagram size={18} />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="w-11 h-11 rounded-full bg-gray-800 hover:bg-green-600 transition-all duration-300 flex items-center justify-center hover:-translate-y-1"
              >
                <FaLinkedinIn size={18} />
              </a>

              <a
                href="#"
                aria-label="GitHub"
                className="w-11 h-11 rounded-full bg-gray-800 hover:bg-green-600 transition-all duration-300 flex items-center justify-center hover:-translate-y-1"
              >
                <FaGithub size={18} />
              </a>

            </div>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700 mt-14 pt-7">
          <p className="text-center text-sm text-gray-500 leading-6">
            © {new Date().getFullYear()} FeedLink. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

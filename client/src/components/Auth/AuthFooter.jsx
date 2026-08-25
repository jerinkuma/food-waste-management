import { Mail, Phone, MapPin, Heart } from "lucide-react";
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
      className="bg-gradient-to-br from-[#0b1f18] via-[#10392b] to-[#14532d] text-white"
    >
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Logo */}

          <div>

            <h2 className="text-4xl font-bold">
              Feed<span className="text-green-400">Link</span>
            </h2>

            <p className="mt-5 text-gray-300 leading-7">
              FeedLink is a smart food waste management platform that
              connects restaurants, food donors and NGOs to reduce
              food waste while helping people in need.
            </p>

          </div>

          {/* Quick Links */}

          <div>

            <h3 className="text-xl font-semibold mb-6">
              Quick Links
            </h3>

            <ul className="space-y-4">

              {[
                "Home",
                "About",
                "How It Works",
                "Services",
                "Contact",
              ].map((item) => (

                <li key={item}>

                  <a
                    href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                    className="text-gray-300 hover:text-green-400 transition duration-300"
                  >
                    {item}
                  </a>

                </li>

              ))}

            </ul>

          </div>

          {/* Contact */}

          <div>

            <h3 className="text-xl font-semibold mb-6">
              Contact
            </h3>

            <div className="space-y-5">

              <div className="flex gap-3">

                <MapPin
                  className="text-green-400 mt-1"
                  size={18}
                />

                <span className="text-gray-300">
                  Dhaka, Bangladesh
                </span>

              </div>

              <div className="flex gap-3">

                <Phone
                  className="text-green-400 mt-1"
                  size={18}
                />

                <span className="text-gray-300">
                  +880 1234-567890
                </span>

              </div>

              <div className="flex gap-3">

                <Mail
                  className="text-green-400 mt-1"
                  size={18}
                />

                <span className="text-gray-300">
                  contact@feedlink.com
                </span>

              </div>

            </div>

          </div>

          {/* Social */}

          <div>

            <h3 className="text-xl font-semibold mb-6">
              Follow Us
            </h3>

            <div className="flex gap-4">

              {[
                FaFacebookF,
                FaInstagram,
                FaLinkedinIn,
                FaGithub,
              ].map((Icon, index) => (

                <a
                  key={index}
                  href="#"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-green-500 hover:shadow-lg hover:shadow-green-500/40"
                >
                  <Icon size={18} />
                </a>

              ))}

            </div>

            <p className="mt-6 text-sm leading-6 text-gray-300">
              Together we can reduce food waste and build a
              hunger-free community.
            </p>

          </div>

        </div>

        {/* Divider */}

        <div className="my-10 border-t border-white/20"></div>

        {/* Bottom */}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-gray-300 text-sm">
            © {new Date().getFullYear()} FeedLink. All Rights Reserved.
          </p>

          <p className="flex items-center gap-2 text-sm text-gray-300">
            Made with
            <Heart
              size={16}
              className="fill-red-500 text-red-500"
            />
            for a Food Waste Free Bangladesh
          </p>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
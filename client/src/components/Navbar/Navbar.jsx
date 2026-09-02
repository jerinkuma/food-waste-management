import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navItems = [
    { name: "Home", id: "home" },
    { name: "About", id: "about" },
    { name: "How It Works", id: "how-it-works" },
    { name: "Services", id: "services" },
    { name: "Contact", id: "contact" },
  ];

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scroll
            ? "bg-white/80 backdrop-blur-xl shadow-lg py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="relative max-w-7xl mx-auto flex items-center justify-between px-6">
          
          {/* Logo */}
          <h1
            className={`text-3xl font-bold ${
              scroll ? "text-green-600" : "text-white"
            }`}
          >
            FeedLink
          </h1>

          {/* Desktop Menu */}
          <ul
            className={`desktop-menu font-medium ${
              scroll ? "text-gray-700" : "text-white"
            }`}
          >
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="cursor-pointer hover:text-green-500 transition duration-300"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile / Tablet Menu Button */}
          <button
            className={`mobile-menu-button ${
              scroll ? "text-black" : "text-white"
            }`}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={34} />
          </button>
        </div>
      </nav>

      {/* ================= MOBILE MENU OVERLAY ================= */}
      <div
        className={`mobile-menu-overlay ${
          menuOpen ? "menu-active" : ""
        }`}
      >
        {/* Background overlay */}
        <div
          className="mobile-menu-backdrop"
          onClick={closeMenu}
        ></div>

        {/* Center Menu Container */}
        <div className="mobile-menu-container">
          
          {/* Close Button */}
          <button
            className="mobile-menu-close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={32} />
          </button>

          {/* Glass Menu Box */}
          <div className="mobile-menu-box">
            
            <p className="mobile-menu-title">
              Feed<span>Link</span>
            </p>

            <div className="mobile-menu-line"></div>

            <ul className="mobile-menu-links">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={closeMenu}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>

          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
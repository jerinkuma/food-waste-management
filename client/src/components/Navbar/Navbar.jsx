import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";



const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scroll, setScroll] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScroll(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { name: "Home", id: "home" },
        { name: "About", id: "about" },
        { name: "How It Works", id: "how-it-works" },
        { name: "Services", id: "services" },
        { name: "Contact", id: "contact" },
    ];

    return (
        <>
            {/* Navbar */}
            <nav
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scroll
                    ? "bg-white/80 backdrop-blur-xl shadow-lg py-4"
                    : "bg-transparent py-6"
                    }`}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6">

                    {/* Logo */}
                    <h1
                        className={`text-3xl font-bold ${scroll ? "text-green-600" : "text-white"
                            }`}
                    >
                        FeedLink
                    </h1>

                    {/* Desktop Menu */}
                    <ul
                        className={`hidden lg:flex gap-10 font-medium ${scroll ? "text-gray-700" : "text-white"
                            }`}
                    >
                        {navItems.map((item) => (
                            <li key={item.id}>
                                <a
                                    href={`#${item.id}`}
                                    className="cursor-pointer hover:text-green-500 transition"
                                >
                                    {item.name}
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* Mobile Button */}
                    <button
                        className={`lg:hidden ${scroll ? "text-black" : "text-white"
                            }`}
                        onClick={() => setMenuOpen(true)}
                    >
                        <Menu size={34} />
                    </button>

                </div>
            </nav>

            {/* Full Screen Mobile Menu */}

            <div
                className={`fixed inset-0 z-[999] transition-all duration-500 ${menuOpen
                    ? "opacity-100 visible"
                    : "opacity-0 invisible"
                    }`}
            >
                {/* Background */}

                <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-lg"
                    onClick={() => setMenuOpen(false)}
                ></div>

                {/* Menu */}

                <div className="relative flex h-full flex-col items-center justify-center">

                    <button
                        className="absolute top-8 right-8 text-white"
                        onClick={() => setMenuOpen(false)}
                    >
                        <X size={40} />
                    </button>

                    <ul className="space-y-8 text-center">

                        {navItems.map((item) => (
                            <li key={item.id}>
                                <a
                                    href={`#${item.id}`}
                                    onClick={() => setMenuOpen(false)}
                                    className="text-4xl font-bold text-white transition hover:text-green-400"
                                >
                                    {item.name}
                                </a>
                            </li>
                        ))}

                    </ul>



                </div>
            </div>
        </>
    );
};

export default Navbar;
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    PlusCircle,
    History,
    BarChart3,
    User,
    Settings,
    LogOut,
} from "lucide-react";


const Sidebar = () => {
    const navigate = useNavigate();
    const menuItems = [
        {
            title: "Dashboard",
            icon: <LayoutDashboard size={20} />,
            path: "/restaurant/dashboard",
        },
        {
            title: "Add Donation",
            icon: <PlusCircle size={20} />,
            path: "/restaurant/add-donation",
        },
        {
            title: "Donation History",
            icon: <History size={20} />,
            path: "/restaurant/donation-history",
        },
        {
            title: "Analytics",
            icon: <BarChart3 size={20} />,
            path: "/restaurant/analytics",
        },
        {
            title: "Profile",
            icon: <User size={20} />,
            path: "/restaurant/profile",
        },

    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-[#0F3D2E] text-white shadow-xl flex flex-col">

            {/* Logo */}

            <div className="border-b border-white/10 p-8">

                <h1 className="text-3xl font-bold">
                    Feed<span className="text-green-400">Link</span>
                </h1>

                <p className="mt-2 text-sm text-green-100">
                    Restaurant Dashboard
                </p>

            </div>

            {/* Menu */}

            <div className="flex-1 overflow-y-auto p-6">

                <ul className="space-y-3">

                    {menuItems.map((item) => (
                        <li key={item.title}>

                            <button
                                onClick={() => navigate(item.path)}
                                className={`flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left transition duration-300
                ${item.active
                                        ? "bg-green-600 text-white shadow-lg"
                                        : "text-green-100 hover:bg-white/10"
                                    }`}
                            >
                                {item.icon}

                                <span className="font-medium">
                                    {item.title}
                                </span>

                            </button>

                        </li>
                    ))}

                </ul>

            </div>

            {/* Bottom */}

            <div className="border-t border-white/10 p-6">

                <button
                    onClick={() => navigate("/")}
                    className="flex w-full items-center gap-4 rounded-xl px-5 py-4 text-red-300 transition hover:bg-red-500 hover:text-white"
                >

                    <LogOut size={20} />

                    <span className="font-medium">
                        Logout
                    </span>

                </button>
            </div>

        </aside>
    );
};

export default Sidebar;
import { Bell, Search, CalendarDays } from "lucide-react";

const Topbar = () => {
  const hour = new Date().getHours();

  let greeting = "";

  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening";
  } else {
    greeting = "Good Night";
  }

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm px-8 py-5">
      <div className="flex items-center justify-between">

        {/* Left */}

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            {greeting}, Cafe One
          </h1>

          <div className="mt-2 flex items-center gap-2 text-gray-500">

            <CalendarDays
              size={18}
              className="text-green-600"
            />

            <span className="text-sm font-medium">
              {today}
            </span>

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-5">

          {/* Search */}

          <div className="relative hidden lg:block">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search donations, NGOs..."
              className="w-80 rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 outline-none transition duration-300 focus:border-green-500 focus:bg-white"
            />

          </div>

          {/* Notification */}

          <button className="relative rounded-xl bg-gray-100 p-3 transition duration-300 hover:bg-green-100">

            <Bell
              size={22}
              className="text-gray-700"
            />

            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500"></span>

          </button>

          {/* Profile */}

          <div className="flex items-center gap-3 rounded-xl bg-gray-100 px-4 py-2 transition duration-300 hover:bg-gray-200">

            <img
              src="https://i.pravatar.cc/100"
              alt="Restaurant"
              className="h-12 w-12 rounded-full object-cover"
            />

            <div>

              <h3 className="font-semibold text-gray-800">
                Cafe One
              </h3>

              <p className="text-sm text-gray-500">
                Restaurant
              </p>

            </div>

          </div>

        </div>

      </div>
    </header>
  );
};

export default Topbar;
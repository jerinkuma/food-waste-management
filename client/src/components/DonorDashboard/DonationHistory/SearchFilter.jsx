import { Search } from "lucide-react";

const SearchFilter = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* Search */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Search Donation
          </label>

          <div className="relative">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search by food name..."
              className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none transition focus:border-green-600"
            />

          </div>

        </div>

        {/* Status */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Filter by Status
          </label>

          <select
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-green-600"
          >

            <option>All</option>

            <option>Pending</option>

            <option>Accepted</option>

            <option>Picked Up</option>

            <option>Completed</option>

            <option>Cancelled</option>

          </select>

        </div>

      </div>

    </div>
  );
};

export default SearchFilter;
import { Eye } from "lucide-react";
import StatusBadge from "./StatusBadge";

const DonationTable = () => {
  const donations = [
    {
      id: 1,
      foodName: "Chicken Biryani",
      foodType: "Rice Meal",
      quantity: "20 kg",
      meals: 80,
      date: "03 Aug 2026",
      status: "Pending",
    },
    {
      id: 2,
      foodName: "Vegetable Khichuri",
      foodType: "Rice Meal",
      quantity: "15 kg",
      meals: 60,
      date: "02 Aug 2026",
      status: "Completed",
    },
    {
      id: 3,
      foodName: "Bread",
      foodType: "Bakery",
      quantity: "8 kg",
      meals: 32,
      date: "01 Aug 2026",
      status: "Accepted",
    },
    {
      id: 4,
      foodName: "Beef Curry",
      foodType: "Curry",
      quantity: "12 kg",
      meals: 48,
      date: "31 Jul 2026",
      status: "Picked Up",
    },
    {
      id: 5,
      foodName: "Mixed Vegetables",
      foodType: "Vegetable",
      quantity: "6 kg",
      meals: 24,
      date: "30 Jul 2026",
      status: "Cancelled",
    },
  ];

  const statusStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";

      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Accepted":
        return "bg-blue-100 text-blue-700";

      case "Picked Up":
        return "bg-purple-100 text-purple-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Food Name
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Food Type
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Quantity
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Meals
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Date
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Status
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {donations.map((donation) => (

              <tr
                key={donation.id}
                className="border-t hover:bg-gray-50 transition"
              >

                <td className="px-6 py-5 font-medium text-gray-800">
                  {donation.foodName}
                </td>

                <td className="px-6 py-5 text-gray-600">
                  {donation.foodType}
                </td>

                <td className="px-6 py-5 text-center">
                  {donation.quantity}
                </td>

                <td className="px-6 py-5 text-center">
                  {donation.meals}
                </td>

                <td className="px-6 py-5 text-center text-gray-600">
                  {donation.date}
                </td>

                <td className="px-6 py-5 text-center">

                  <StatusBadge status={donation.status} />

                </td>

                <td className="px-6 py-5 text-center">

                  <button className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700">

                    <Eye size={16} />

                    View

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default DonationTable;
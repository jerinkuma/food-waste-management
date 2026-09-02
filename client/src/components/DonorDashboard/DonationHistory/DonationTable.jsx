import StatusBadge from "./StatusBadge";

const DonationTable = ({
  donations = [],
  loading,
}) => {
  const getDisplayStatus = (status) => {
    if (status === "Waiting for NGO Acceptance") {
      return "Pending";
    }

    if (status === "NGO Accepted") {
      return "Accepted";
    }

    if (status === "Rejected") {
      return "Rejected";
    }

    return status;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-gray-500">
          Loading donation history...
        </p>
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-gray-500">
          No donations found.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[650px]">
          
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 sm:px-6">
                Food
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 sm:px-6">
                Quantity
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 sm:px-6">
                Estimated Meals
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 sm:px-6">
                Date
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 sm:px-6">
                Status
              </th>

            </tr>
          </thead>

          <tbody>
            {donations.map((donation) => (
              <tr
                key={donation._id}
                className="border-b border-gray-100 transition hover:bg-gray-50"
              >
                
                {/* Food */}
                <td className="px-4 py-4 sm:px-6">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {donation.foodName}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {donation.foodType}
                    </p>
                  </div>
                </td>

                {/* Quantity */}
                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 sm:px-6">
                  {donation.quantity} KG
                </td>

                {/* Estimated Meals */}
                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 sm:px-6">
                  {donation.estimatedMeals}
                </td>

                {/* Date */}
                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 sm:px-6">
                  {formatDate(donation.createdAt)}
                </td>

                {/* Status */}
                <td className="px-4 py-4 sm:px-6">
                  <StatusBadge
                    status={getDisplayStatus(
                      donation.status
                    )}
                  />
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
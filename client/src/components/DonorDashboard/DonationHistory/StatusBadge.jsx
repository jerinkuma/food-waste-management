const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-yellow-100 text-yellow-700",
    Accepted: "bg-blue-100 text-blue-700",
    "Picked Up": "bg-purple-100 text-purple-700",
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-4 py-2 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
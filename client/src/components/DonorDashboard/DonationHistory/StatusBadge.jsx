const StatusBadge = ({ status }) => {
  const statusStyles = {
    Pending:
      "bg-yellow-100 text-yellow-700 border-yellow-200",

    Accepted:
      "bg-green-100 text-green-700 border-green-200",

    Rejected:
      "bg-red-100 text-red-700 border-red-200",
  };

  const style =
    statusStyles[status] ||
    "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
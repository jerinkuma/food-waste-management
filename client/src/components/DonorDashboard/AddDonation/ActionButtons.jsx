import { Save, X, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ActionButtons = () => {
  const navigate = useNavigate();

  const handlePublish = () => {
    navigate("/restaurant/donation-success");
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

      <div className="flex flex-col gap-4 md:flex-row md:justify-end">

        {/* Cancel */}

        <button
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-8 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          <X size={20} />
          Cancel
        </button>

        {/* Save Draft */}

        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <Save size={20} />
          Save Draft
        </button>

        {/* Publish */}

        <button
          onClick={handlePublish}
          className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          <QrCode size={20} />
          Publish Donation
        </button>

      </div>

    </div>
  );
};

export default ActionButtons;
import { X } from "lucide-react";

const EditProfileModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold text-gray-900">
            Edit Profile
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={22} />
          </button>

        </div>

        <div className="space-y-5">

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Restaurant Name
            </label>

            <input
              type="text"
              defaultValue="Green Leaf Restaurant"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-green-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Phone Number
            </label>

            <input
              type="text"
              defaultValue="+8801712345678"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-green-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Trade License Number
            </label>

            <input
              type="text"
              defaultValue="TRD-45896321"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-green-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Address
            </label>

            <textarea
              rows={3}
              defaultValue="Banani, Dhaka, Bangladesh"
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-green-500 outline-none"
            />
          </div>

        </div>

        <div className="mt-8 flex justify-end gap-4">

          <button
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-6 py-3 font-medium hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
};

export default EditProfileModal;
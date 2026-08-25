import { useState } from "react";
import { Store, BadgeCheck, SquarePen } from "lucide-react";
import EditProfileModal from "./EditProfileModal";

const ProfileCard = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

        <div className="flex flex-col items-center">

          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-green-100">
            <Store size={55} className="text-green-700" />
          </div>

          <h2 className="mt-5 text-3xl font-bold text-gray-900">
            Green Leaf Restaurant
          </h2>

          <p className="mt-2 text-gray-500">
            Restaurant Partner
          </p>

          <div className="mt-4 flex items-center gap-2 rounded-full bg-green-100 px-5 py-2">
            <BadgeCheck size={18} className="text-green-600" />

            <span className="font-medium text-green-700">
              Trade License Verified
            </span>
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="mt-8 flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            <SquarePen size={18} />
            Edit Profile
          </button>

        </div>

      </div>

      <EditProfileModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
      />
    </>
  );
};

export default ProfileCard;
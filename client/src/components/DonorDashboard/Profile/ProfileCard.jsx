
import { useState } from "react";
import {
  Store,
  SquarePen,
} from "lucide-react";

import EditProfileModal from "./EditProfileModal";
import { API_BASE_URL } from "../../../config";

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  return `${API_BASE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

const ProfileCard = ({
  profile,
  setProfile,
}) => {
  const [openModal, setOpenModal] = useState(false);

  const imageUrl = getImageUrl(profile?.profileImage);

  return (
    <>
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">

        {/* Profile Image */}
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-green-100 bg-green-100 shadow-sm sm:h-36 sm:w-36">

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={profile?.name || "Restaurant profile"}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Store
              size={60}
              className="text-green-700"
            />
          )}

        </div>

        {/* Restaurant Name */}
        <h2 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl">
          {profile?.name || "Restaurant"}
        </h2>

        {/* Edit Profile */}
        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="mt-6 flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700"
        >
          <SquarePen size={18} />
          Edit Profile
        </button>

      </div>

      {/* Edit Modal */}
      <EditProfileModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        profile={profile}
        setProfile={setProfile}
      />
    </>
  );
};

export default ProfileCard;

import { useEffect, useState } from "react";
import {
  X,
  Camera,
  Loader2,
  Store,
} from "lucide-react";

const EditProfileModal = ({
  isOpen,
  onClose,
  profile,
  setProfile,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tradeLicense, setTradeLicense] =
    useState("");
  const [address, setAddress] = useState("");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =====================================
  // LOAD CURRENT PROFILE DATA
  // =====================================

  useEffect(() => {
    if (profile && isOpen) {
      setName(profile.name || "");
      setPhone(profile.phone || "");

      setTradeLicense(
        profile.tradeLicense || ""
      );

      setAddress(profile.address || "");

      setImage(null);

      setPreview(
        profile.profileImage
          ? `http://localhost:5000${profile.profileImage}`
          : ""
      );

      setError("");
    }
  }, [profile, isOpen]);

  if (!isOpen) {
    return null;
  }

  // =====================================
  // SELECT IMAGE
  // =====================================

  const handleImageChange = (e) => {
    const selectedFile =
      e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        selectedFile.type
      )
    ) {
      setError(
        "Please select a JPG, JPEG, PNG or WEBP image."
      );
      return;
    }

    if (
      selectedFile.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Image size must be less than 5 MB."
      );
      return;
    }

    setError("");
    setImage(selectedFile);

    const imagePreview =
      URL.createObjectURL(
        selectedFile
      );

    setPreview(imagePreview);
  };

  // =====================================
  // SAVE PROFILE
  // =====================================

  const handleSave = async () => {
    setError("");

    if (!name.trim()) {
      setError(
        "Restaurant name is required."
      );
      return;
    }

    if (!phone.trim()) {
      setError(
        "Phone number is required."
      );
      return;
    }

    if (!tradeLicense.trim()) {
      setError(
        "Trade license number is required."
      );
      return;
    }

    if (!address.trim()) {
      setError(
        "Address is required."
      );
      return;
    }

    try {
      const userData =
        localStorage.getItem("user");

      const user = userData
        ? JSON.parse(userData)
        : null;

      if (!user?.id) {
        setError(
          "User information not found. Please login again."
        );
        return;
      }

      setSaving(true);

      const formData =
        new FormData();

      formData.append(
        "name",
        name.trim()
      );

      formData.append(
        "phone",
        phone.trim()
      );

      formData.append(
        "tradeLicense",
        tradeLicense.trim()
      );

      formData.append(
        "address",
        address.trim()
      );

      if (image) {
        formData.append(
          "profileImage",
          image
        );
      }

      const response = await fetch(
        `http://localhost:5000/api/restaurants/profile/${user.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update profile."
        );
      }

      // =====================================
      // UPDATE PROFILE STATE
      // =====================================

      setProfile(data.restaurant);

      // =====================================
      // UPDATE LOCAL STORAGE
      // =====================================

      const updatedUser = {
        ...user,
        name: data.restaurant.name,
        profileImage:
          data.restaurant.profileImage || "",
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      // Reset selected image
      setImage(null);

      // Close modal
      onClose();

    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setError(
        error.message ||
          "Failed to update profile."
      );

    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold text-gray-900">
            Edit Profile
          </h2>

          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 transition hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={22} />
          </button>

        </div>

        {/* Profile Image */}
        <div className="mb-7 flex flex-col items-center">

          <div className="relative">

            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-green-100 bg-green-100">

              {preview ? (
                <img
                  src={preview}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Store
                  size={52}
                  className="text-green-700"
                />
              )}

            </div>

            {/* Camera Button */}
            <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition hover:bg-green-700">

              <Camera size={18} />

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={
                  handleImageChange
                }
                className="hidden"
              />

            </label>

          </div>

          <p className="mt-3 text-center text-sm text-gray-500">
            Click the camera icon to change profile photo
          </p>

          <p className="mt-1 text-xs text-gray-400">
            JPG, PNG or WEBP • Maximum 5 MB
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-5">

          {/* Name */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Restaurant Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Phone Number
            </label>

            <input
              type="text"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          {/* Trade License */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Trade License Number
            </label>

            <input
              type="text"
              value={tradeLicense}
              onChange={(e) =>
                setTradeLicense(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Address
            </label>

            <textarea
              rows={3}
              value={address}
              onChange={(e) =>
                setAddress(
                  e.target.value
                )
              }
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">

          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-gray-300 px-6 py-3 font-medium transition hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {saving ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Saving...
              </>
            ) : (
              "Save Changes"
            )}

          </button>

        </div>

      </div>
    </div>
  );
};

export default EditProfileModal;
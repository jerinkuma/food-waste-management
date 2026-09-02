
import { useState } from "react";

import {
  Mail,
  ShieldCheck,
  CalendarDays,
  Clock3,
  X,
  LockKeyhole,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

const AccountInfo = ({
  profile,
}) => {
  const [openPasswordModal, setOpenPasswordModal] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  const joinedDate = profile.createdAt
    ? new Date(
        profile.createdAt
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "N/A";


  // =====================================
  // OPEN PASSWORD MODAL
  // =====================================

  const openModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setOpenPasswordModal(true);
  };


  // =====================================
  // CLOSE PASSWORD MODAL
  // =====================================

  const closeModal = () => {
    if (saving) return;

    setOpenPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };


  // =====================================
  // CHANGE PASSWORD
  // =====================================

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");


    // Current password
    if (!currentPassword) {
      setError(
        "Please enter your current password."
      );
      return;
    }


    // New password
    if (!newPassword) {
      setError(
        "Please enter a new password."
      );
      return;
    }


    // Minimum length
    if (newPassword.length < 6) {
      setError(
        "New password must be at least 6 characters."
      );
      return;
    }


    // Confirm password
    if (!confirmPassword) {
      setError(
        "Please confirm your new password."
      );
      return;
    }


    // Match
    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirm password do not match."
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

      console.log("USER FROM LOCAL STORAGE:", user);
console.log("CHANGE PASSWORD URL:",
  `http://localhost:5000/api/auth/change-password/${user.id}`
);


      const response = await fetch(
        `http://localhost:5000/api/auth/change-password/${user.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to change password."
        );
      }


      setSuccess(
        "Password changed successfully!"
      );


      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");


      // Close after short delay
      setTimeout(() => {
        setOpenPasswordModal(false);
        setSuccess("");
      }, 1500);

    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setError(
        error.message ||
          "Failed to change password."
      );

    } finally {
      setSaving(false);
    }
  };


  return (
    <>
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Account Information
        </h2>


        <div className="space-y-6">

          {/* Email */}
          <div className="flex items-start gap-4">

            <div className="rounded-xl bg-green-100 p-3">
              <Mail
                size={22}
                className="text-green-700"
              />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-gray-500">
                Email Address
              </p>

              <h3 className="break-all text-lg font-semibold text-gray-900">
                {profile.email}
              </h3>
            </div>

          </div>


          {/* Account Type */}
          <div className="flex items-start gap-4">

            <div className="rounded-xl bg-blue-100 p-3">
              <ShieldCheck
                size={22}
                className="text-blue-700"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Account Type
              </p>

              <h3 className="text-lg font-semibold text-gray-900">
                Restaurant Donor
              </h3>
            </div>

          </div>


          {/* Joined */}
          <div className="flex items-start gap-4">

            <div className="rounded-xl bg-purple-100 p-3">
              <CalendarDays
                size={22}
                className="text-purple-700"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Joined On
              </p>

              <h3 className="text-lg font-semibold text-gray-900">
                {joinedDate}
              </h3>
            </div>

          </div>


          {/* Last Login */}
          <div className="flex items-start gap-4">

            <div className="rounded-xl bg-yellow-100 p-3">
              <Clock3
                size={22}
                className="text-yellow-700"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Last Login
              </p>

              <h3 className="text-lg font-semibold text-gray-900">
                Not available
              </h3>
            </div>

          </div>

        </div>


        {/* Change Password Button */}
        <button
          onClick={openModal}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-lg font-semibold text-white transition duration-300 hover:bg-green-700"
        >
          <LockKeyhole size={19} />
          Change Password
        </button>

      </div>


      {/* =====================================
          CHANGE PASSWORD MODAL
      ===================================== */}

      {openPasswordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update your account password
                </p>
              </div>


              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 transition hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={22} />
              </button>

            </div>


            {/* Success */}
            {success && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {success}
              </div>
            )}


            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}


            <div className="space-y-5">

              {/* Current Password */}
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Current Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter current password"
                    disabled={saving}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-green-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>
              </div>


              {/* New Password */}
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  New Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter new password"
                    disabled={saving}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-green-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

                <p className="mt-1 text-xs text-gray-400">
                  Minimum 6 characters
                </p>
              </div>


              {/* Confirm Password */}
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Confirm New Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm new password"
                    disabled={saving}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-green-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>
              </div>

            </div>


            {/* Buttons */}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-gray-300 px-6 py-3 font-medium transition hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>


              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {saving ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Updating...
                  </>
                ) : (
                  <>
                    <LockKeyhole size={18} />
                    Update Password
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
};

export default AccountInfo;


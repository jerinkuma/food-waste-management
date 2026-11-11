import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  Upload,
  Calendar,
  Package,
  CheckCircle2,
  Image as ImageIcon
} from "lucide-react";

import { API_URL } from "../../../config";

export default function DistributionProofPage() {
  const [completedDonations, setCompletedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form fields
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch completed donations
  useEffect(() => {
    fetchCompletedDonations();
  }, []);

  const fetchCompletedDonations = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/ngo/completed-donations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data.success) {
        setCompletedDonations(response.data.donations || []);
      }
    } catch (err) {
      console.error("Error fetching completed donations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open proof modal
  const handleOpenModal = (donation) => {
    setSelectedDonation(donation);
    setDescription("");
    setImageFiles([]);
    setImagePreviews([]);
    setMessage("");
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    imagePreviews.forEach((preview) => {
      URL.revokeObjectURL(preview);
    });

    setShowModal(false);
    setSelectedDonation(null);
    setDescription("");
    setImageFiles([]);
    setImagePreviews([]);
    setMessage("");
  };

  // Select images
  const handleImageChange = (e) => {
    const filesArray = Array.from(e.target.files);

    if (filesArray.length === 0) return;

    const remainingSlots = 30 - imageFiles.length;

    if (remainingSlots <= 0) {
      setMessage("Maximum 30 images allowed.");
      e.target.value = "";
      return;
    }

    const selectedFiles = filesArray.slice(0, remainingSlots);

    setImageFiles((prev) => [...prev, ...selectedFiles]);

    const newPreviews = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setImagePreviews((prev) => [...prev, ...newPreviews]);

    if (filesArray.length > remainingSlots) {
      setMessage(
        "Maximum 30 images allowed. Extra images were not added."
      );
    } else {
      setMessage("");
    }

    e.target.value = "";
  };

  // Remove selected image
  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);

    setImageFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setImagePreviews((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // Submit distribution proof
  const handleSubmitProof = async (e) => {
    e.preventDefault();

    if (!selectedDonation) {
      setMessage("Please select a donation first.");
      return;
    }

    if (imageFiles.length === 0) {
      setMessage(
        "Please select at least one distribution proof image."
      );
      return;
    }

    setSubmitting(true);
    setMessage("");

    const formData = new FormData();

    formData.append(
      "restaurantId",
      selectedDonation.donor?._id ||
        selectedDonation.donor ||
        ""
    );

    formData.append("donationId", selectedDonation._id);

    formData.append(
      "description",
      `Food: ${selectedDonation.foodName || "Donation"} | Qty: ${
        selectedDonation.quantity
      } | Details: ${description}`
    );

    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await axios.post(
        `${API_URL}/ngo/submit-distribution`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data.success) {
        setMessage(
          "Distribution proof submitted successfully and notification sent to the restaurant!"
        );

        await fetchCompletedDonations();

        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      }
    } catch (err) {
      console.error("Submission error:", err);

      setMessage(
        err.response?.data?.message || "Failed to submit proof."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-400 font-medium text-sm">
        Loading completed donations...
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Distribution Proof Management
        </h2>
      </div>

      {/* Full Width Dark Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden w-full">
        {completedDonations.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-medium text-sm">No completed donations found.</p>
            <p className="text-slate-500 text-xs mt-1">Completed pickups requiring verification will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Food</th>
                  <th className="py-4 px-6">Restaurant</th>
                  <th className="py-4 px-6">Quantity</th>
                  <th className="py-4 px-6">Reference ID</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {completedDonations.map((item) => {
                  const restaurantName =
                    item.donor?.organizationName ||
                    item.donor?.name ||
                    item.restaurantName ||
                    "Restaurant Partner";

                  const foodTitle = item.foodName || "Donation Food";
                  const foodCategory = item.category || item.foodType || "Surplus Food";

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">
                            {foodTitle}
                          </span>
                          <span className="text-xs text-slate-400 mt-0.5">
                            {foodCategory}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-slate-200 font-medium">
                          {restaurantName}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-slate-200 font-medium">
                          {item.quantity} KG
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-xs text-slate-400">
                          {item.donationId || item._id}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-sm transition cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Distribution Proof
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Distribution proof modal */}
      {showModal && selectedDonation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-5">
              <h3 className="text-lg font-bold text-white">
                Submit Distribution Proof
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Partner:{" "}
                <span className="font-semibold text-emerald-400">
                  {selectedDonation.donor?.organizationName ||
                    selectedDonation.donor?.name ||
                    "Restaurant"}
                </span>
                {" • "}
                Item: <span className="font-semibold text-white">{selectedDonation.foodName}</span>
              </p>
            </div>

            {message && (
              <div
                className={`mb-4 p-3.5 rounded-xl text-xs font-medium flex items-start gap-2 ${
                  message.includes("successfully")
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                  Distribution Summary & Notes
                </label>
                <textarea
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-white resize-none transition"
                  rows="3"
                  placeholder="Provide brief context regarding beneficiary count, distribution venue, or delivery handover..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                  Verification Media (Max 30 Images)
                </label>

                <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/70 rounded-xl p-4 text-center bg-slate-950/50 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                  />
                  <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-300">Click to upload or drag & drop</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">PNG, JPG, WEBP supported (Multiple selection enabled)</p>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2 max-h-44 overflow-y-auto p-2 border border-slate-800 rounded-xl bg-slate-950">
                    {imagePreviews.map((src, index) => (
                      <div
                        key={index}
                        className="relative group w-full h-16 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-xs"
                      >
                        <img
                          src={src}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 opacity-80 group-hover:opacity-100 transition shadow-sm cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-500 transition text-xs shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  "Submitting Proof..."
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Submit & Send to Restaurant
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
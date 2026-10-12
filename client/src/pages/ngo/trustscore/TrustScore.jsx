
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./TrustScore.css";

const API_BASE = "http://localhost:5000/api";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id || value.id || "");
};

const getDonorName = (donor) => {
  if (!donor) return "Unknown Donor";
  if (typeof donor === "string") return "Donor";
  return donor.name || donor.restaurantName || donor.email || "Unknown Donor";
};

const getDonationStatus = (donation) =>
  String(donation?.pipelineStatus || donation?.status || "").toLowerCase();

const isCompletedDonation = (donation) => {
  const status = getDonationStatus(donation);
  return (
    status.includes("completed") ||
    status.includes("delivered")
  );
};

const getDonationId = (donation) =>
  donation?.donationId || getId(donation);

const TrustScore = ({ themeMode = "light" }) => {
  const [donors, setDonors] = useState([]);
  const [pendingRatings, setPendingRatings] = useState([]);
  const [selectedDonorDetail, setSelectedDonorDetail] = useState(null);
  const [selectedRatingItem, setSelectedRatingItem] = useState(null);

  const [userStars, setUserStars] = useState(4);
  const [selectedTag, setSelectedTag] = useState("Best Food Quality");
  const [reviewComment, setReviewComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingTypeFilter, setRatingTypeFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isDark = themeMode === "dark";

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    return token
      ? { Authorization: `Bearer ${token}` }
      : {};
  };

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = getStoredUser();

      if (!user) {
        throw new Error(
          "Login information পাওয়া যায়নি। NGO account দিয়ে আবার login করো।"
        );
      }

      // The existing controller accepts either NGO profile ID
      // or the user ID associated with that NGO profile.
      const ngoId = getId(user);

      if (!ngoId) {
        throw new Error(
          "NGO user ID পাওয়া যায়নি। আবার login করে চেষ্টা করো।"
        );
      }

      const response = await axios.get(
        `${API_BASE}/donations/ngo/${ngoId}`,
        { headers: getAuthHeaders() }
      );

      const payload = response.data || {};

      if (payload.success === false) {
        throw new Error(
          payload.message || "NGO donations load করা যায়নি।"
        );
      }

      const donations = Array.isArray(payload.donations)
        ? payload.donations
        : [
            ...(Array.isArray(payload.active) ? payload.active : []),
            ...(Array.isArray(payload.archived) ? payload.archived : []),
          ];

      // Group donations by donor User ID.
      const donorMap = new Map();

      donations.forEach((donation) => {
        const donor = donation?.donor;

        if (!donor || typeof donor !== "object") return;

        const donorId = getId(donor);

        if (!donorId) return;

        if (!donorMap.has(donorId)) {
          donorMap.set(donorId, {
            _id: donorId,
            name: getDonorName(donor),
            email: donor.email || "",
            location:
              donation.pickupAddress ||
              donation.address ||
              "Location not available",
            totalDonations: 0,
            trustScore: 0,
            tags: [],
            reviews: [],
            recentImages: [],
            isFollowed: false,
            donations: [],
          });
        }

        const donorEntry = donorMap.get(donorId);

        donorEntry.totalDonations += 1;
        donorEntry.donations.push(donation);

        const location =
          donation.pickupAddress || donation.address;

        if (
          location &&
          donorEntry.location === "Location not available"
        ) {
          donorEntry.location = location;
        }
      });

      const donorList = Array.from(donorMap.values());

      setDonors(donorList);

      // Completed donations are candidates for feedback.
      // Existing Feedback records are checked separately below
      // only if the current backend response exposes them.
      const completedDonations = donations.filter(
        isCompletedDonation
      );

      setPendingRatings(
        completedDonations.map((donation) => ({
          _id: getId(donation),
          donationId: getDonationId(donation),
          orderId: donation.donationId || getId(donation),
          donorId: getId(donation.donor),
          donorName: getDonorName(donation.donor),
          donor: getDonorName(donation.donor),
          food: donation.foodName || "Food donation",
          donation,
        }))
      );
    } catch (err) {
      console.error(
        "Trust Score loading error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Donor list load করা যায়নি। Backend connection check করো।"
      );

      setDonors([]);
      setPendingRatings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  const filteredDonors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return donors.filter((donor) => {
      const matchesSearch =
        !query ||
        donor.name.toLowerCase().includes(query) ||
        donor.location.toLowerCase().includes(query) ||
        donor.email.toLowerCase().includes(query);

      // Ratings are not yet available in the donation response.
      // Do not invent a rating to classify donors.
      const matchesFilter =
        ratingTypeFilter === "all";

      return matchesSearch && matchesFilter;
    });
  }, [donors, searchQuery, ratingTypeFilter]);

  const handleRatingSubmit = async () => {
    if (!selectedRatingItem || submitting) return;

    const donation = selectedRatingItem.donation;
    const donor = donation?.donor;
    const ngo = donation?.ngoRequest?.requestedBy;

    if (!donation || !getId(donor)) {
      setError("এই donation-এর donor information পাওয়া যায়নি।");
      return;
    }

    if (!getDonationId(donation)) {
      setError("Donation ID পাওয়া যায়নি।");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      /*
       * Uses the existing POST /api/feedback route and the
       * Feedback model fields already present in your backend.
       *
       * The existing submitFeedback controller must accept these
       * fields and associate the feedback with the donation.
       */
      const response = await axios.post(
        `${API_BASE}/feedback`,
        {
          donation: getId(donation),
          donationId: String(getDonationId(donation)),
          ngo: getId(ngo) || undefined,
          donor: getId(donor),
          donorName: getDonorName(donor),
          category: "Donor Rating",
          tags: [selectedTag],
          rating: Number(userStars),
          message:
            reviewComment.trim() ||
            `Donor rating: ${selectedTag}`,
          comment: reviewComment.trim(),
          submittedBy: "NGO Admin",
          date: new Date().toISOString(),
        },
        { headers: getAuthHeaders() }
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Feedback submit করা যায়নি।"
        );
      }

      setSuccess("Feedback submit হয়েছে।");
      setSelectedRatingItem(null);
      setReviewComment("");
      setUserStars(4);
      setSelectedTag("Best Food Quality");

      // Refresh donation data after submitting feedback.
      await fetchDonors();
    } catch (err) {
      console.error(
        "Feedback submission error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Feedback submit করা যায়নি। Backend route ও validation check করো।"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (stars) => {
    const labels = {
      5: "Excellent Experience",
      4: "Good Experience",
      3: "Average Experience",
      2: "Poor Experience",
      1: "Very Bad Experience",
    };

    return labels[stars] || "Rate Your Experience";
  };

  const pageClass = isDark
    ? "bg-slate-900 text-slate-100"
    : "bg-slate-50 text-slate-900";

  const cardClass = isDark
    ? "bg-slate-800 border-slate-700"
    : "bg-white border-slate-200";

  const closeRatingModal = () => {
    if (submitting) return;
    setSelectedRatingItem(null);
    setReviewComment("");
  };

  return (
    <div
      className={`min-h-screen space-y-6 p-4 font-sans transition-colors ${pageClass}`}
    >
      {/* Header */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 ${cardClass}`}
      >
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            DONOR TRUST SCORE & NETWORK
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Donors connected to your accepted donations
          </p>
        </div>

        <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800">
          {donors.length} Donors
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {success}
        </div>
      )}

      <div className="grid grid-cols-12 items-start gap-6">
        {/* Donor network */}
        <section className="col-span-12 space-y-4 lg:col-span-8">
          <div className={`space-y-4 rounded-2xl border p-5 ${cardClass}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-extrabold tracking-wide">
                  RESTAURANTS & DONORS NETWORK
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Donors are collected from your NGO donation history.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchDonors}
                disabled={loading}
                className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRatingTypeFilter("all")}
                className={`rounded-lg border px-3 py-2 text-xs font-bold ${
                  ratingTypeFilter === "all"
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-slate-300 bg-slate-100 text-slate-700"
                }`}
              >
                All Donors
              </button>
            </div>

            <input
              type="text"
              placeholder="Search donor by name, email or location..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600"
            />

            <div className="space-y-3">
              {loading ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  Loading donors...
                </div>
              ) : filteredDonors.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  {error
                    ? "Donor data load হয়নি। উপরের error message দেখো।"
                    : "এই NGO-এর donation records-এ কোনো donor পাওয়া যায়নি।"}
                </div>
              ) : (
                filteredDonors.map((donor, index) => (
                  <div
                    key={donor._id}
                    className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 ${
                      isDark
                        ? "border-slate-700 bg-slate-800"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-xs font-extrabold text-emerald-800">
                        #{index + 1}
                      </div>

                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setSelectedDonorDetail(donor)}
                          className="break-words text-left text-sm font-extrabold text-emerald-700 hover:underline"
                        >
                          {donor.name}
                        </button>

                        <p className="mt-1 break-words text-xs text-slate-500">
                          {donor.email || "Email not available"}
                        </p>

                        <p className="mt-1 break-words text-xs text-slate-500">
                          {donor.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {donor.totalDonations} Donations
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Rating not calculated yet
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedDonorDetail(donor)}
                        className="rounded-lg border border-emerald-300 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Pending feedback */}
        <aside className="col-span-12 space-y-4 lg:col-span-4">
          <div className={`space-y-4 rounded-2xl border p-5 ${cardClass}`}>
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-extrabold tracking-wide">
                PENDING FEEDBACK
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Completed donations eligible for review
              </p>
            </div>

            {loading ? (
              <p className="text-center text-sm text-slate-500">
                Loading donations...
              </p>
            ) : pendingRatings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-500">
                No completed donations found for feedback.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRatings.map((item) => (
                  <div
                    key={item._id}
                    className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="break-all text-[10px] font-bold text-slate-500">
                        {item.orderId}
                      </span>
                      <span className="rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">
                        Completed
                      </span>
                    </div>

                    <h5 className="break-words text-xs font-extrabold text-slate-900">
                      {item.donorName}
                    </h5>

                    <p className="text-xs text-slate-600">
                      {item.food}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setSuccess("");
                        setSelectedRatingItem(item);
                      }}
                      className="w-full rounded-xl bg-emerald-700 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                    >
                      Rate This Donor
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Donor details modal */}
      {selectedDonorDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="break-words text-base font-extrabold">
                {selectedDonorDetail.name} — Donor Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDonorDetail(null)}
                className="px-2 text-lg font-bold text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 text-xs sm:grid-cols-2">
              <p>
                <strong>Location:</strong>{" "}
                {selectedDonorDetail.location}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {selectedDonorDetail.email || "Not available"}
              </p>
              <p>
                <strong>Total Donations:</strong>{" "}
                {selectedDonorDetail.totalDonations}
              </p>
            </div>

            <h4 className="text-sm font-extrabold">
              Donation History
            </h4>

            <div className="space-y-2">
              {selectedDonorDetail.donations.map((donation, index) => (
                <div
                  key={getId(donation) || index}
                  className="rounded-xl border border-slate-200 p-3 text-xs"
                >
                  <p className="font-bold">
                    {donation.foodName || "Food donation"}
                  </p>
                  <p className="mt-1 text-slate-500">
                    ID: {getDonationId(donation)}
                  </p>
                  <p className="mt-1 text-slate-500">
                    Status:{" "}
                    {donation.pipelineStatus || donation.status || "Unknown"}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSelectedDonorDetail(null)}
              className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-900"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Rating modal */}
      {selectedRatingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-extrabold">
                  Rate Donor Experience
                </h3>
                <p className="mt-1 break-words text-xs text-slate-500">
                  {selectedRatingItem.donorName}
                </p>
                <p className="mt-1 break-all text-[10px] text-slate-500">
                  Donation ID: {selectedRatingItem.orderId}
                </p>
              </div>

              <button
                type="button"
                onClick={closeRatingModal}
                disabled={submitting}
                className="text-base font-bold text-slate-500 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 py-2 text-center">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Select Rating
              </label>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserStars(star)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg ${
                      star <= userStars
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-300 bg-slate-100 text-slate-500"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <span className="inline-block rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                {getRatingLabel(userStars)}
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Feedback Highlight
              </label>

              <div className="flex flex-wrap gap-2">
                {[
                  "Best Food Quality",
                  "Fresh Food",
                  "On Time Pickup",
                  "Delayed Pickup",
                  "Cold Food",
                  "Packaging Issue",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${
                      selectedTag === tag
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-300 bg-slate-100 text-slate-800"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Detailed Review (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Food quality, packaging or pickup experience..."
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleRatingSubmit}
                disabled={submitting}
                className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-extrabold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>

              <button
                type="button"
                onClick={closeRatingModal}
                disabled={submitting}
                className="rounded-xl bg-slate-200 px-5 py-3 text-xs font-extrabold text-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustScore;

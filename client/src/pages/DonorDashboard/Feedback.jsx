import { useEffect, useState } from "react";
import {
  MessageSquareText,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  Utensils,
  Star,
  Award,
} from "lucide-react";

import DashboardLayout from "../../components/DonorDashboard/DashboardLayout";
import {
  fetchDonorNgoReviews,
  submitDonorFeedback,
  submitDonorNgoRating,
} from "../../services/api";

const Feedback = () => {
  const [donations, setDonations] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [ratings, setRatings] = useState([]);

  const [messages, setMessages] = useState({});
  const [ratingSelections, setRatingSelections] = useState({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState({});
  const [ratingSubmitting, setRatingSubmitting] = useState({});
  const [errors, setErrors] = useState({});
  const [ratingErrors, setRatingErrors] = useState({});

  // =========================================
  // LOAD DATA
  // =========================================

  const loadReviews = async () => {
    try {
      setLoading(true);

      const response = await fetchDonorNgoReviews();

      setDonations(response.donations || []);
      setFeedbacks(response.feedbacks || []);
      setRatings(response.ratings || []);
    } catch (error) {
      console.error("Failed to load NGO reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // =========================================
  // HELPER FUNCTIONS
  // =========================================

  const getId = (value) => {
    if (!value) return "";

    return String(value._id || value.id || value);
  };

  const getDonationId = (donation) => {
    return (
      donation?.donationId ||
      donation?._id ||
      ""
    );
  };

  const getNgoName = (ngo) => {
    if (!ngo || typeof ngo === "string") {
      return "NGO Name Not Found";
    }

    return (
      ngo.user?.fullName ||
      ngo.user?.name ||
      ngo.name ||
      "NGO Name Not Found"
    );
  };

  // =========================================
  // GET REQUESTED NGOS FROM DONATION
  // =========================================

  const getDonationNgoRequests = (donation) => {
    const requests = [];

    // New multiple NGO request structure
    (donation.ngoRequests || []).forEach((request) => {
      if (request.requestedBy) {
        requests.push({
          ngo: request.requestedBy,
          status: request.status || "Pending",
        });
      }
    });

    // Legacy single NGO request structure
    if (donation.ngoRequest?.requestedBy) {
      requests.push({
        ngo: donation.ngoRequest.requestedBy,
        status: donation.ngoRequest.status || "Requested",
      });
    }

    // Remove duplicate NGO requests for the same donation
    const uniqueRequests = [];
    const seen = new Set();

    requests.forEach((request) => {
      const ngoId = getId(request.ngo);

      if (ngoId && !seen.has(ngoId)) {
        seen.add(ngoId);
        uniqueRequests.push(request);
      }
    });

    return uniqueRequests;
  };

  // =========================================
// FEEDBACK EXPIRY: 3 HOURS AFTER COMPLETION
// =========================================

const THREE_HOURS = 3 * 60 * 60 * 1000;

const getCompletedAt = (donation) => {
  const history = donation.statusHistory || [];

  const completedEntry = [...history]
    .reverse()
    .find((entry) => entry.status === "Completed");

  return (
    completedEntry?.changedAt ||
    donation.verification?.verifiedAt ||
    null
  );
};

const isFeedbackExpired = (donation) => {
  const isCompleted =
    donation.status === "Completed" ||
    donation.pipelineStatus === "Completed";

  // Incomplete donations will remain in Feedback.
  if (!isCompleted) return false;

  const completedAt = getCompletedAt(donation);

  if (!completedAt) return false;

  const completedTime = new Date(completedAt).getTime();

  if (Number.isNaN(completedTime)) return false;

  return Date.now() - completedTime >= THREE_HOURS;
};

  // =========================================
  // CREATE NGO GROUPS
  // One NGO can have multiple donations.
  // =========================================

  const ngoGroupsMap = {};

  donations.forEach((donation) => {
    const requests = getDonationNgoRequests(donation);

    requests.forEach((request) => {
      const ngoId = getId(request.ngo);

      if (!ngoId) return;

      if (!ngoGroupsMap[ngoId]) {
        ngoGroupsMap[ngoId] = {
          id: ngoId,
          name: getNgoName(request.ngo),
          donations: [],
        };
      }

      ngoGroupsMap[ngoId].donations.push({
        donation,
        requestStatus: request.status,
        ngo: request.ngo,
      });
    });
  });

  const ngoGroups = Object.values(ngoGroupsMap);

  // =========================================
// FEEDBACK CARDS
// Hide donations 3 hours after completion.
// =========================================

const reviewCards = ngoGroups.flatMap((group) =>
  group.donations
    .filter((item) => !isFeedbackExpired(item.donation))
    .map((item) => ({
      ...item,
      ngoId: group.id,
      ngoName: group.name,
    }))
);
  // =========================================
  // RATING CARDS
  // Each NGO appears ONLY ONCE.
  // =========================================

  const ratingCards = ngoGroups.map((group) => ({
    ngoId: group.id,
    ngoName: group.name,

    // Used internally because the existing rating API
    // requires donationId.
    donation: group.donations[0]?.donation || null,
  }));

  // =========================================
  // FIND EXISTING FEEDBACK
  // =========================================

  const getDonorFeedback = (donation, ngoId) => {
    return feedbacks.find((feedback) => {
      return (
        getId(feedback.donation) === getId(donation._id) &&
        getId(feedback.ngo) === String(ngoId)
      );
    });
  };

  // =========================================
  // FIND EXISTING RATING
  // Search by NGO only, not by donation.
  // =========================================

  const getExistingRating = (ngoId) => {
    return ratings.find((item) => {
      return getId(item.ngo) === String(ngoId);
    });
  };

  // =========================================
  // SUBMIT FEEDBACK
  // =========================================

  const handleSubmitFeedback = async (donation, ngoId) => {
    const donationId = getDonationId(donation);
    const messageKey = `${donationId}_${ngoId}`;
    const message = messages[messageKey]?.trim();

    if (!message) {
      setErrors((prev) => ({
        ...prev,
        [messageKey]: "Please write your feedback first.",
      }));

      return;
    }

    try {
      setSubmitting((prev) => ({
        ...prev,
        [messageKey]: true,
      }));

      setErrors((prev) => ({
        ...prev,
        [messageKey]: "",
      }));

      await submitDonorFeedback({
        donationId,
        ngoId,
        message,
      });

      setMessages((prev) => ({
        ...prev,
        [messageKey]: "",
      }));

      await loadReviews();
    } catch (error) {
      console.error("Feedback submission failed:", error);

      setErrors((prev) => ({
        ...prev,
        [messageKey]:
          error.response?.data?.message ||
          "Failed to submit feedback. Please try again.",
      }));
    } finally {
      setSubmitting((prev) => ({
        ...prev,
        [messageKey]: false,
      }));
    }
  };

  // =========================================
  // SELECT NGO RATING
  // =========================================

  const handleRatingSelect = (ngoId, score) => {
    setRatingSelections((prev) => ({
      ...prev,
      [ngoId]: score,
    }));

    setRatingErrors((prev) => ({
      ...prev,
      [ngoId]: "",
    }));
  };

  // =========================================
  // SUBMIT NGO RATING
  // One rating option per NGO.
  // =========================================

  const handleSubmitRating = async (ratingCard) => {
    const { ngoId, donation } = ratingCard;
    const key = ngoId;
    const rating = ratingSelections[key];

    if (!donation) {
      setRatingErrors((prev) => ({
        ...prev,
        [key]: "No donation request found for this NGO.",
      }));

      return;
    }

    if (!rating) {
      setRatingErrors((prev) => ({
        ...prev,
        [key]: "Please select a star rating.",
      }));

      return;
    }

    try {
      setRatingSubmitting((prev) => ({
        ...prev,
        [key]: true,
      }));

      setRatingErrors((prev) => ({
        ...prev,
        [key]: "",
      }));

      await submitDonorNgoRating({
        donationId: getDonationId(donation),
        ngoId,
        rating,
      });

      setRatingSelections((prev) => ({
        ...prev,
        [key]: 0,
      }));

      await loadReviews();
    } catch (error) {
      console.error("NGO rating submission failed:", error);

      setRatingErrors((prev) => ({
        ...prev,
        [key]:
          error.response?.data?.message ||
          "Failed to submit rating. Please try again.",
      }));
    } finally {
      setRatingSubmitting((prev) => ({
        ...prev,
        [key]: false,
      }));
    }
  };

  // =========================================
  // STATUS BADGE
  // =========================================

  const StatusBadge = ({ status }) => {
    if (status === "Approved") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle size={14} />
          Approved
        </span>
      );
    }

    if (status === "Declined") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
          <XCircle size={14} />
          Declined
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        <Clock size={14} />
        Pending Approval
      </span>
    );
  };

  // =========================================
  // DONATION INFO
  // Used only in Feedback section.
  // =========================================

  const DonationInfo = ({ donation }) => (
    <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <Utensils size={16} className="shrink-0 text-slate-500" />

        <span className="truncate text-sm font-bold text-slate-800">
          {donation.foodName || "Food Donation"}
        </span>
      </div>

      <p className="mt-2 break-all text-xs font-medium text-slate-500">
        Donation ID: {getDonationId(donation)}
      </p>
    </div>
  );

  // =========================================
  // UI
  // =========================================

  return (
    <DashboardLayout>
      <div className="w-full space-y-7">

        

        {loading ? (
          <div className="flex justify-center rounded-2xl border border-slate-200 bg-white py-16">
            <Loader2
              size={34}
              className="animate-spin text-blue-600"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-7 2xl:grid-cols-2">

            {/* =====================================
                FEEDBACK SECTION
            ===================================== */}

            <section className="min-w-0 overflow-hidden rounded-2xl border-2 border-blue-200 bg-white shadow-md">

              <div className="flex items-center gap-3 border-b-2 border-blue-200 bg-blue-50 px-5 py-5">
                <div className="rounded-xl border border-blue-200 bg-white p-3 shadow-sm">
                  <MessageSquareText
                    size={23}
                    className="text-blue-700"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-blue-1000">
                    Feedback to NGOs
                  </h2>

                  <p className="mt-1 text-xs text-blue-700">
                    Send written feedback to requesting NGOs.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5">

                {reviewCards.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50/50 py-12 text-center">
                    <Building2
                      size={38}
                      className="mx-auto mb-3 text-blue-100"
                    />

                    <p className="font-semibold text-slate-700">
                      No NGO requests found.
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      NGOs that request your donations will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {reviewCards.map((item) => {
                      const donation = item.donation;
                      const ngoId = item.ngoId;
                      const ngoName = item.ngoName;

                      const donationId = getDonationId(donation);
                      const key = `${donationId}_${ngoId}`;

                      const existingFeedback = getDonorFeedback(
                        donation,
                        ngoId
                      );

                      return (
                        <article
                          key={`feedback_${donation._id}_${ngoId}`}
                          className="flex min-w-0 flex-col rounded-xl border-2 border-blue-200 bg-white p-4 shadow-sm transition duration-200 hover:border-blue-400 hover:shadow-md"
                        >
                          <div className="mb-4 flex items-start gap-3">
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-2">
                              <Building2
                                size={19}
                                className="text-blue-700"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="break-words text-sm font-bold text-slate-1000">
                                {ngoName}
                              </h3>

                              <p className="mt-1 text-xs text-slate-500">
                                NGO feedback
                              </p>
                            </div>
                          </div>

                          <DonationInfo donation={donation} />

                          {existingFeedback ? (
                            <div className="flex flex-1 flex-col rounded-xl border border-slate-300 bg-slate-50 p-3">
                              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-bold text-slate-800">
                                  Your Feedback
                                </p>

                                <StatusBadge
                                  status={existingFeedback.status}
                                />
                              </div>

                              <p className="flex-1 break-words text-sm leading-relaxed text-slate-600">
                                {existingFeedback.message}
                              </p>

                              <p className="mt-3 border-t border-slate-200 pt-2 text-xs text-slate-500">
                                Submitted for Admin review
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-1 flex-col">
                              <label className="mb-2 block text-sm font-bold text-slate-700">
                                Your Feedback
                              </label>

                              <textarea
                                rows={4}
                                value={messages[key] || ""}
                                onChange={(e) =>
                                  setMessages((prev) => ({
                                    ...prev,
                                    [key]: e.target.value,
                                  }))
                                }
                                placeholder={`Write your feedback to ${ngoName}...`}
                                className="w-full resize-none rounded-xl border-2 border-slate-300 bg-white p-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              />

                              {errors[key] && (
                                <p className="mt-2 text-xs font-medium text-red-600">
                                  {errors[key]}
                                </p>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  handleSubmitFeedback(donation, ngoId)
                                }
                                disabled={submitting[key]}
                                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-700 bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {submitting[key] ? (
                                  <>
                                    <Loader2
                                      size={16}
                                      className="animate-spin"
                                    />
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <Send size={15} />
                                    Submit Feedback
                                  </>
                                )}
                              </button>

                              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                Your feedback will be visible to the NGO after Admin approval.
                              </p>
                            </div>
                          )}
                        </article>
                      );
                    })}

                  </div>
                )}
              </div>
            </section>

            {/* =====================================
                RATING SECTION
                ONE CARD PER UNIQUE NGO
            ===================================== */}

            <section className="min-w-0 overflow-hidden rounded-2xl border-2 border-amber-200 bg-white shadow-md">

              <div className="flex items-center gap-3 border-b-2 border-amber-200 bg-amber-50 px-5 py-5">
                <div className="rounded-xl border border-amber-200 bg-white p-3 shadow-sm">
                  <Award
                    size={23}
                    className="text-amber-700"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-amber-950">
                    Rate NGOs
                  </h2>

                  <p className="mt-1 text-xs text-amber-800">
                    Each requesting NGO appears only once.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5">

                {ratingCards.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 py-12 text-center">
                    <Star
                      size={38}
                      className="mx-auto mb-3 text-amber-300"
                    />

                    <p className="font-semibold text-slate-700">
                      No NGOs available for rating.
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      NGOs that request your food donations will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {ratingCards.map((item) => {
                      const ngoId = item.ngoId;
                      const ngoName = item.ngoName;
                      const key = ngoId;

                      const existingRating = getExistingRating(ngoId);
                      const selectedRating =
                        ratingSelections[key] || 0;

                      return (
                        <article
                          key={`rating_${ngoId}`}
                          className="flex min-w-0 flex-col rounded-xl border-2 border-amber-200 bg-white p-4 shadow-sm transition duration-200 hover:border-amber-400 hover:shadow-md"
                        >
                          {/* NGO INFORMATION */}
                          <div className="mb-5 flex items-start gap-3">
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2">
                              <Building2
                                size={21}
                                className="text-amber-700"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="break-words text-sm font-bold text-slate-1000">
                                {ngoName}
                              </h3>

                              <p className="mt-1 text-xs text-slate-500">
                                NGO Service Rating
                              </p>
                            </div>
                          </div>

                          {/* ALREADY RATED */}
                          {existingRating ? (
                            <div className="flex flex-1 flex-col rounded-xl border-2 border-amber-200 bg-amber-50 p-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-bold text-slate-800">
                                  Your Rating
                                </p>

                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                  Submitted
                                </span>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={23}
                                    className={
                                      star <= Number(existingRating.rating)
                                        ? "fill-amber-400 text-amber-500"
                                        : "text-slate-300"
                                    }
                                  />
                                ))}

                                <span className="ml-2 text-sm font-bold text-slate-800">
                                  {existingRating.rating}/5
                                </span>
                              </div>

                              <p className="mt-auto pt-4 text-xs text-slate-600">
                                Thank you for rating this NGO.
                              </p>
                            </div>
                          ) : (
                            /* RATING FORM */
                            <div className="flex flex-1 flex-col">
                              <p className="mb-3 text-sm font-bold text-slate-700">
                                How would you rate this NGO?
                              </p>

                              <div className="flex flex-wrap items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() =>
                                      handleRatingSelect(ngoId, star)
                                    }
                                    title={`${star} star${star > 1 ? "s" : ""}`}
                                    className="rounded-lg border border-transparent p-1 transition hover:scale-110 hover:border-amber-200 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                  >
                                    <Star
                                      size={27}
                                      className={
                                        star <= selectedRating
                                          ? "fill-amber-400 text-amber-500"
                                          : "text-slate-300 hover:text-amber-400"
                                      }
                                    />
                                  </button>
                                ))}

                                <span className="ml-2 text-xs font-bold text-slate-600">
                                  {selectedRating
                                    ? `${selectedRating}/5`
                                    : "Select stars"}
                                </span>
                              </div>

                              {ratingErrors[key] && (
                                <p className="mt-2 text-xs font-medium text-red-600">
                                  {ratingErrors[key]}
                                </p>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  handleSubmitRating(item)
                                }
                                disabled={ratingSubmitting[key]}
                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-600 bg-amber-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {ratingSubmitting[key] ? (
                                  <>
                                    <Loader2
                                      size={16}
                                      className="animate-spin"
                                    />
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <Star
                                      size={15}
                                      className="fill-white"
                                    />
                                    Submit Rating
                                  </>
                                )}
                              </button>

                              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                You can rate this NGO only once.
                              </p>
                            </div>
                          )}
                        </article>
                      );
                    })}

                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Feedback;
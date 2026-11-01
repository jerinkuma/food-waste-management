
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import DashboardLayout from "../../components/DonorDashboard/DashboardLayout";
import {
  fetchDonorNgoReviews,
  submitDonorFeedback,
} from "../../services/api";

const Feedback = () => {
  const [donations, setDonations] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState({});
  const [errors, setErrors] = useState({});
  const [expandedNgos, setExpandedNgos] = useState({});

  // =====================================
  // FETCH NGO REQUESTS AND FEEDBACKS
  // =====================================
  const loadReviews = async () => {
    try {
      setLoading(true);

      const response = await fetchDonorNgoReviews();

      setDonations(response.donations || []);
      setFeedbacks(response.feedbacks || []);
    } catch (error) {
      console.error("Failed to load NGO requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // =====================================
  // GET NGO FULL NAME
  // =====================================
  const getNgoName = (ngo) => {
    if (!ngo || typeof ngo === "string") {
      return "NGO Name Not Found";
    }

    return (
      ngo.user?.fullName ||
      ngo.user?.name ||
      "NGO Name Not Found"
    );
  };

  // =====================================
  // GET NGO FROM DONATION
  // =====================================
  const getDonationNgo = (donation) => {
    return donation.ngoRequest?.requestedBy;
  };

  // =====================================
  // GROUP DONATIONS BY NGO NAME
  // =====================================
  const requestedDonations = donations.filter(
    (donation) => donation.ngoRequest?.requestedBy
  );

  const groupedRequestedDonations = requestedDonations.reduce(
    (groups, donation) => {
      const ngo = getDonationNgo(donation);
      const ngoName = getNgoName(ngo);
      const groupKey = ngoName.trim().toLowerCase();

      if (!groups[groupKey]) {
        groups[groupKey] = {
          name: ngoName,
          donations: [],
        };
      }

      groups[groupKey].donations.push(donation);

      return groups;
    },
    {}
  );

  const ngoGroups = Object.entries(groupedRequestedDonations);

  // =====================================
  // TOGGLE NGO GROUP
  // =====================================
  const toggleNgoGroup = (groupKey) => {
    setExpandedNgos((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  // =====================================
  // FIND DONOR FEEDBACK FOR DONATION
  // =====================================
  const getDonorFeedback = (donation) => {
    return feedbacks.find((feedback) => {
      const feedbackDonation =
        feedback.donation?._id || feedback.donation;

      return (
        String(feedbackDonation) === String(donation._id) &&
        feedback.submittedBy === "Donor"
      );
    });
  };

  // =====================================
  // SUBMIT DONOR FEEDBACK
  // =====================================
  const handleSubmitFeedback = async (donation) => {
    const donationId = donation.donationId;
    const message = messages[donationId]?.trim();

    if (!message) {
      setErrors((prev) => ({
        ...prev,
        [donationId]: "Please write your feedback first.",
      }));
      return;
    }

    try {
      setSubmitting((prev) => ({
        ...prev,
        [donationId]: true,
      }));

      setErrors((prev) => ({
        ...prev,
        [donationId]: "",
      }));

      await submitDonorFeedback({
        donationId,
        message,
      });

      setMessages((prev) => ({
        ...prev,
        [donationId]: "",
      }));

      await loadReviews();
    } catch (error) {
      console.error("Feedback submission failed:", error);

      setErrors((prev) => ({
        ...prev,
        [donationId]:
          error.response?.data?.message ||
          "Failed to submit feedback. Please try again.",
      }));
    } finally {
      setSubmitting((prev) => ({
        ...prev,
        [donationId]: false,
      }));
    }
  };

  // =====================================
  // STATUS BADGE
  // =====================================
  const StatusBadge = ({ status }) => {
    if (status === "Approved") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          <CheckCircle size={14} />
          Approved
        </span>
      );
    }

    if (status === "Declined") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          <XCircle size={14} />
          Declined
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
        <Clock size={14} />
        Pending Approval
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">

        {/* PAGE HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Feedback
          </h1>

        
        </div>

        {/* NGO REQUESTS HEADING - OUTSIDE CARDS */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <MessageSquareText
              size={23}
              className="text-blue-600"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              NGOs Requested Your Donations
            </h2>

            <p className="text-sm text-gray-500">
              Send feedback to NGOs that requested your donations.
            </p>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2
              size={30}
              className="animate-spin text-blue-600"
            />
          </div>
        ) : ngoGroups.length === 0 ? (
          /* EMPTY STATE */
          <div className="py-12 text-center">
            <Building2
              size={42}
              className="mx-auto mb-3 text-gray-300"
            />

            <p className="font-medium text-gray-600">
              No NGO requests found.
            </p>

            <p className="mt-1 text-sm text-gray-400">
              NGOs that request your donations will appear here.
            </p>
          </div>
        ) : (
          /* NGO CARDS - FULL WIDTH, TWO COLUMNS */
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">

            {ngoGroups.map(([groupKey, group]) => {
              const isExpanded =
                expandedNgos[groupKey] !== false;

              return (
                <div
                  key={groupKey}
                  className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                >

                  {/* NGO CARD HEADER */}
                  <button
                    type="button"
                    onClick={() => toggleNgoGroup(groupKey)}
                    className="flex w-full items-center gap-3 bg-blue-100 p-4 text-left transition hover:bg-blue-100"
                  >
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Building2
                        size={22}
                        className="text-blue-600"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {group.name}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        {group.donations.length}{" "}
                        {group.donations.length === 1
                          ? "donation request"
                          : "donation requests"}
                      </p>
                    </div>

                    {isExpanded ? (
                      <ChevronUp
                        size={20}
                        className="shrink-0 text-blue-600"
                      />
                    ) : (
                      <ChevronDown
                        size={20}
                        className="shrink-0 text-blue-600"
                      />
                    )}
                  </button>

                  {/* DONATIONS */}
                  {isExpanded && (
                    <div className="space-y-4 p-4">

                      {group.donations.map((donation) => {
                        const existingFeedback =
                          getDonorFeedback(donation);

                        const donationId = donation.donationId;

                        return (
                          <div
                            key={donation._id}
                            className="min-w-0 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                          >

                            {/* DONATION INFORMATION */}
                            <div className="mb-3 rounded-lg bg-gray-50 p-3">
                              <div className="flex items-center gap-2">
                                <Utensils
                                  size={16}
                                  className="shrink-0 text-gray-500"
                                />

                                <span className="break-words text-sm font-semibold text-gray-700">
                                  {donation.foodName}
                                </span>
                              </div>

                              <p className="mt-1 break-all text-xs text-gray-500">
                                Donation ID: {donation.donationId}
                              </p>

                              {donation.createdAt && (
                                <p className="mt-1 text-xs text-gray-500">
                                  Date:{" "}
                                  {new Date(
                                    donation.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>

                            {/* EXISTING FEEDBACK */}
                            {existingFeedback ? (
                              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">

                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-gray-700">
                                    Your Feedback
                                  </p>

                                  <StatusBadge
                                    status={existingFeedback.status}
                                  />
                                </div>

                                <p className="break-words text-sm leading-relaxed text-gray-600">
                                  {existingFeedback.message}
                                </p>

                                <p className="mt-2 text-xs text-gray-400">
                                  Submitted for Admin review
                                </p>
                              </div>
                            ) : (
                              /* FEEDBACK FORM */
                              <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                  Your Feedback to {group.name}
                                </label>

                                <textarea
                                  rows={3}
                                  value={messages[donationId] || ""}
                                  onChange={(e) =>
                                    setMessages((prev) => ({
                                      ...prev,
                                      [donationId]: e.target.value,
                                    }))
                                  }
                                  placeholder={`Write your feedback to ${group.name}...`}
                                  className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                {errors[donationId] && (
                                  <p className="mt-1 text-xs text-red-500">
                                    {errors[donationId]}
                                  </p>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSubmitFeedback(donation)
                                  }
                                  disabled={submitting[donationId]}
                                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {submitting[donationId] ? (
                                    <>
                                      <Loader2
                                        size={16}
                                        className="animate-spin"
                                      />
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <Send size={16} />
                                      Submit Feedback
                                    </>
                                  )}
                                </button>

                                <p className="mt-2 text-xs text-gray-400">
                                  Your feedback will be visible to the NGO
                                  only after Admin approval.
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}

                    </div>
                  )}
                </div>
              );
            })}

          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Feedback;

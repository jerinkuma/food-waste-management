
import { useEffect, useState } from "react";
import {
  Star,
  MessageSquareText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Building2,
} from "lucide-react";

import DashboardLayout from "../../components/DonorDashboard/DashboardLayout";
import { fetchDonorNgoReviews } from "../../services/api";

const NGOReviews = () => {
  const [donations, setDonations] = useState([]);
  const [ngoFeedbacks, setNgoFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================
  // FETCH NGO REVIEWS
  // =====================================
  const loadReviews = async () => {
    try {
      setLoading(true);

      const response = await fetchDonorNgoReviews();

      setDonations(response.donations || []);
      setNgoFeedbacks(response.ngoFeedbacks || []);
    } catch (error) {
      console.error("Failed to load NGO reviews:", error);
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

  // =====================================
  // FILTER RATED DONATIONS
  // =====================================
  const ratedDonations = donations.filter(
    (donation) => donation.rating?.score
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* PAGE HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            NGO Reviews
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View ratings and written feedback received from NGOs.
          </p>
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* =====================================
              NGO RATINGS
          ====================================== */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="rounded-lg bg-yellow-100 p-2">
                <Star
                  size={22}
                  className="text-yellow-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  NGO Ratings
                </h2>

                <p className="text-sm text-gray-500">
                  Star ratings received from NGOs.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2
                  size={28}
                  className="animate-spin text-yellow-600"
                />
              </div>
            ) : ratedDonations.length === 0 ? (
              <div className="py-8 text-center">
                <Star
                  size={38}
                  className="mx-auto mb-3 text-gray-300"
                />

                <p className="font-medium text-gray-600">
                  No ratings yet.
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  NGO star ratings will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {ratedDonations.map((donation) => (
                  <div
                    key={donation._id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-lg bg-yellow-50 p-2">
                        <Building2
                          size={21}
                          className="text-yellow-600"
                        />
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Rated by NGO
                        </p>

                        <h3 className="font-semibold text-gray-800">
                          {getNgoName(getDonationNgo(donation))}
                        </h3>

                        <p className="text-xs text-gray-500">
                          {donation.foodName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={19}
                          className={
                            star <= donation.rating.score
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}

                      <span className="ml-2 text-sm font-semibold text-gray-700">
                        {donation.rating.score}/5
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      Donation ID: {donation.donationId}
                    </p>

                    {donation.rating.ratedAt && (
                      <p className="mt-1 text-xs text-gray-400">
                        Rated on:{" "}
                        {new Date(
                          donation.rating.ratedAt
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* =====================================
              NGO WRITTEN FEEDBACK
              APPROVED ONLY
          ====================================== */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="rounded-lg bg-purple-100 p-2">
                <MessageSquareText
                  size={22}
                  className="text-purple-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  NGO Feedback
                </h2>

                <p className="text-sm text-gray-500">
                  Written feedback approved by Admin.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2
                  size={28}
                  className="animate-spin text-purple-600"
                />
              </div>
            ) : ngoFeedbacks.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquareText
                  size={38}
                  className="mx-auto mb-3 text-gray-300"
                />

                <p className="font-medium text-gray-600">
                  No approved NGO feedback yet.
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  NGO written feedback will appear here
                  after Admin approval.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ngoFeedbacks.map((feedback) => (
                  <div
                    key={feedback._id}
                    className="rounded-xl border border-purple-100 bg-purple-50/40 p-4"
                  >
                    {/* NGO NAME */}
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-lg bg-purple-100 p-2">
                        <Building2
                          size={21}
                          className="text-purple-600"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500">
                          Feedback from NGO
                        </p>

                        <h3 className="font-semibold text-gray-800">
                          {getNgoName(feedback.ngo)}
                        </h3>
                      </div>

                      <StatusBadge status="Approved" />
                    </div>

                    {/* FEEDBACK MESSAGE */}
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-sm leading-relaxed text-gray-700">
                        {feedback.message}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-gray-400">
                        Donation ID: {feedback.donationId}
                      </p>

                      <p className="text-xs text-gray-400">
                        {feedback.createdAt
                          ? new Date(
                              feedback.createdAt
                            ).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NGOReviews;

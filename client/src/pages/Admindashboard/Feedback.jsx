import React, { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  Search,
  Users,
  Building2,
  RefreshCw,
  Mail,
  CalendarDays,
  CheckCircle,
  XCircle,
  Send,
  AlertCircle,
} from "lucide-react";

import {
  fetchFeedback,
  updateFeedbackStatus,
  sendAdminFeedback,
} from "../../services/api";

import "./Feedback.css";

// Feedback sender identify
const isDonorFeedback = (feedback) => {
  const submittedBy = String(feedback.submittedBy || "").toLowerCase();
  const category = String(feedback.category || "").toLowerCase();

  return (
    submittedBy === "donor" ||
    category.includes("donor rating")
  );
};

// Feedback message
const getMessage = (feedback) =>
  feedback.message || feedback.comment || feedback.feedback || "";

// Feedback sender name
const getSenderName = (feedback) =>
  feedback.donorName ||
  feedback.ngoName ||
  feedback.ngo?.name ||
  feedback.restaurantName ||
  feedback.restaurant?.name ||
  "Unknown User";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [warningMessages, setWarningMessages] = useState({});
  const [sendingWarningId, setSendingWarningId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Load feedback
  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchFeedback();

      const list = Array.isArray(response)
        ? response
        : response?.feedbacks || response?.feedback || [];

      setFeedbacks(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load feedback:", err);
      setError(
        err.response?.data?.message ||
          "Feedback load করা যায়নি।"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  // Update feedback status
  const handleStatusChange = async (feedbackId, newStatus) => {
    if (!feedbackId || updatingId) return;

    try {
      setUpdatingId(feedbackId);

      const response = await updateFeedbackStatus(
        feedbackId,
        newStatus
      );

      if (response.success || response.feedback) {
        setFeedbacks((prev) =>
          prev.map((item) =>
            String(item._id || item.id) === String(feedbackId)
              ? { ...item, status: newStatus }
              : item
          )
        );
      } else {
        alert("Feedback status update করা যায়নি।");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update feedback status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Search filtering
  const filteredFeedbacks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return feedbacks;

    return feedbacks.filter((feedback) => {
      const name = getSenderName(feedback);
      const message = getMessage(feedback);

      const donationId = String(feedback.donationId || "");
      const category = String(feedback.category || "");
      const status = String(feedback.status || "");
      const sender = String(feedback.submittedBy || "");

      return [
        name,
        message,
        donationId,
        category,
        status,
        sender,
      ].some((value) =>
        String(value).toLowerCase().includes(query)
      );
    });
  }, [feedbacks, search]);

  // Separate Donor and NGO feedback
  const donorFeedbacks = useMemo(
    () => filteredFeedbacks.filter(isDonorFeedback),
    [filteredFeedbacks]
  );

  const ngoFeedbacks = useMemo(
    () => filteredFeedbacks.filter((item) => !isDonorFeedback(item)),
    [filteredFeedbacks]
  );

  // Send warning
  
// =====================================
// SEND ADMIN WARNING TO DONOR / NGO
// =====================================
const handleSendWarning = async (feedback) => {
  const feedbackId = feedback._id || feedback.id;

  const warningMessage = (
    warningMessages[feedbackId] || ""
  ).trim();

  if (!warningMessage) {
    alert("দয়া করে আগে ওয়ার্নিং মেসেজটি লিখুন!");
    return;
  }

  if (!feedbackId) {
    alert("Feedback ID পাওয়া যায়নি।");
    return;
  }

  try {
    setSendingWarningId(feedbackId);

    // Backend will identify the correct recipient
    // using feedback.submittedBy
    const response = await sendAdminFeedback({
      feedbackId,
      message: warningMessage,
    });

    if (response.success) {
      alert(
        `সফলভাবে ${isDonorFeedback(feedback) ? "Donor" : "NGO"}-কে Admin warning পাঠানো হয়েছে!`
      );

      setWarningMessages((prev) => ({
        ...prev,
        [feedbackId]: "",
      }));
    } else {
      alert(
        response.message || "Warning message পাঠানো যায়নি।"
      );
    }

  } catch (err) {
    console.error("Failed to send warning:", err);

    alert(
      err.response?.data?.message ||
      "মেসেজ পাঠাতে ব্যর্থ হয়েছে।"
    );

  } finally {
    setSendingWarningId(null);
  }
};


  // Format date
  const formatDate = (date) => {
    if (!date) return "Recent";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "Recent";

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Feedback card
  const renderFeedbackCard = (feedback, index) => {
    const feedbackId = feedback._id || feedback.id || index;

    const currentStatus =
      feedback.status || "Awaiting Response";

    const normalizedStatus = currentStatus.toLowerCase();

    const isApproved = normalizedStatus === "approved";
    const isDeclined = normalizedStatus === "declined";

    const isUpdating =
      String(updatingId) === String(feedbackId);

    const isSending =
      String(sendingWarningId) === String(feedbackId);

    return (
      <div className="admin-feedback-card" key={feedbackId}>
        {/* Card Header */}
        <div className="admin-feedback-card-header">
          <div className="admin-feedback-user">
            <div className="admin-feedback-avatar">
              {isDonorFeedback(feedback) ? (
                <Users size={19} />
              ) : (
                <Building2 size={19} />
              )}
            </div>

            <div className="admin-feedback-user-info">
              <strong>{getSenderName(feedback)}</strong>

              <span>
                <CalendarDays size={13} />
                {formatDate(feedback.date || feedback.createdAt)}
              </span>
            </div>
          </div>

          <span
            className={`admin-feedback-status ${
              isApproved
                ? "approved"
                : isDeclined
                ? "declined"
                : "pending"
            }`}
          >
            {currentStatus}
          </span>
        </div>

        {/* Feedback Information */}
        <div className="admin-feedback-meta">
          <span>
            Donation ID: <strong>{feedback.donationId || "N/A"}</strong>
          </span>

          <span>
            Category: <strong>{feedback.category || "General"}</strong>
          </span>
        </div>

        {/* Message */}
        <div className="admin-feedback-message">
          <MessageSquare size={16} />

          <p>
            {getMessage(feedback) || "No message provided."}
          </p>
        </div>

        {/* Rating */}
        {feedback.rating && (
          <div className="admin-feedback-rating">
            <span>Rating</span>
            <strong>★ {feedback.rating}/5</strong>
          </div>
        )}

        {/* Status Actions */}
        <div className="admin-feedback-actions">
          <button
            type="button"
            className="admin-feedback-approve"
            onClick={() =>
              handleStatusChange(feedback._id || feedback.id, "Approved")
            }
            disabled={
              !feedback._id && !feedback.id
                ? true
                : isUpdating || isApproved || updatingId !== null
            }
          >
            <CheckCircle size={14} />
            {isUpdating ? "Updating..." : "Approve"}
          </button>

          <button
            type="button"
            className="admin-feedback-decline"
            onClick={() =>
              handleStatusChange(feedback._id || feedback.id, "Declined")
            }
            disabled={
              !feedback._id && !feedback.id
                ? true
                : isUpdating || isDeclined || updatingId !== null
            }
          >
            <XCircle size={14} />
            Decline
          </button>
        </div>

        {/* Warning Message */}
        <div className="admin-feedback-warning">
          <label>
            <Mail size={15} />
            Send Warning Message
          </label>

          <div className="admin-feedback-warning-input">
            <input
              type="text"
              placeholder="Write warning message..."
              value={warningMessages[feedbackId] || ""}
              onChange={(event) =>
                setWarningMessages((prev) => ({
                  ...prev,
                  [feedbackId]: event.target.value,
                }))
              }
            />

            <button
              type="button"
              onClick={() => handleSendWarning(feedback)}
              disabled={isSending}
            >
              <Send size={14} />
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-feedback-page">

      {/* Page Header */}
      <div className="admin-feedback-heading">
        <div className="admin-feedback-heading-icon">
          <MessageSquare size={25} />
        </div>

        <div>
          <p className="admin-feedback-eyebrow">
            ADMINISTRATION 
          </p>

          <h1>Feedback Management</h1>

          <p>
            Review and manage feedback received from Donors and NGOs.
          </p>
        </div>
      </div>

      {/* Summary + Search */}
      <div className="admin-feedback-overview">

        <div className="admin-feedback-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search feedback, name, donation ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="button"
          className="admin-feedback-refresh"
          onClick={loadFeedback}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "admin-feedback-spinning" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="admin-feedback-state">
          <RefreshCw
            size={27}
            className="admin-feedback-spinning"
          />
          <p>Loading feedback from database...</p>
        </div>
      ) : error ? (
        <div className="admin-feedback-state error">
          <AlertCircle size={28} />
          <p>{error}</p>

          <button type="button" onClick={loadFeedback}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Two Feedback Sections */}
          <div className="admin-feedback-columns">

            {/* Donor Feedback */}
            <section className="admin-feedback-section">
              <div className="admin-feedback-section-header donor">
                <div className="admin-feedback-section-title">
                  <div className="admin-feedback-section-icon">
                    <Users size={19} />
                  </div>

                  <div>
                    <h2>Donor Feedback</h2>
                    <p>Feedback submitted by donors</p>
                  </div>
                </div>

                <span className="admin-feedback-count donor-count">
                  {donorFeedbacks.length}
                </span>
              </div>

              <div className="admin-feedback-list">
                {donorFeedbacks.length > 0 ? (
                  donorFeedbacks.map(renderFeedbackCard)
                ) : (
                  <div className="admin-feedback-empty">
                    <Users size={30} />
                    <h3>No Donor Feedback</h3>
                    <p>
                      {search
                        ? "No matching donor feedback found."
                        : "No donor feedback received yet."}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* NGO Feedback */}
            <section className="admin-feedback-section">
              <div className="admin-feedback-section-header ngo">
                <div className="admin-feedback-section-title">
                  <div className="admin-feedback-section-icon">
                    <Building2 size={19} />
                  </div>

                  <div>
                    <h2>NGO Feedback</h2>
                    <p>Feedback submitted by NGOs</p>
                  </div>
                </div>

                <span className="admin-feedback-count ngo-count">
                  {ngoFeedbacks.length}
                </span>
              </div>

              <div className="admin-feedback-list">
                {ngoFeedbacks.length > 0 ? (
                  ngoFeedbacks.map(renderFeedbackCard)
                ) : (
                  <div className="admin-feedback-empty">
                    <Building2 size={30} />
                    <h3>No NGO Feedback</h3>
                    <p>
                      {search
                        ? "No matching NGO feedback found."
                        : "No NGO feedback received yet."}
                    </p>
                  </div>
                )}
              </div>
            </section>

          </div>
        </>
      )}
    </div>
  );
};

export default Feedback;
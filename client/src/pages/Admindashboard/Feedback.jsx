import React, { useEffect, useState, useMemo } from "react";
import { fetchFeedback, updateFeedbackStatus, sendAdminFeedback } from "../../services/api";
import "./Feedback.css";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setError("Feedback load করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      const response = await updateFeedbackStatus(feedbackId, newStatus);
      if (response.success || response.feedback) {
        setFeedbacks((prev) =>
          prev.map((item) =>
            (item._id === feedbackId || item.id === feedbackId)
              ? { ...item, status: newStatus }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    }
  };

  // রেস্টুরেন্ট বা ডোনারের নাম বের করার সঠিক লজিক
  const getRestaurantName = (feedback) => {
    return (
      feedback.donorName ||
      feedback.restaurantName ||
      feedback.restaurant?.name ||
      (typeof feedback.restaurant === "object" && feedback.restaurant?.name) ||
      "Unknown Restaurant"
    );
  };

  const getMessage = (feedback) =>
    feedback.message || feedback.comment || feedback.feedback || "";

  const filteredFeedbacks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return feedbacks;

    return feedbacks.filter((feedback) => {
      const name = getRestaurantName(feedback);
      const msg = getMessage(feedback);
      const donationId = feedback.donationId || "";
      return (
        name.toLowerCase().includes(query) ||
        msg.toLowerCase().includes(query) ||
        donationId.toLowerCase().includes(query)
      );
    });
  }, [feedbacks, search]);

  return (
    <div className="page">
      <h1>
        <span className="page-icon">💬</span> Feedback Management
      </h1>

      <div className="feedback-summary">
        <div className="feedback-summary-card">
          <span>Total Feedback</span>
          <strong>{loading ? "..." : feedbacks.length}</strong>
          <small>Feedback received from users</small>
        </div>
      </div>

      <div className="feedback-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by restaurant name, donation ID or message..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="feedback-state">Loading feedback from database...</div>
      ) : error ? (
        <div className="feedback-state feedback-error">
          <p>{error}</p>
          <button type="button" onClick={() => loadFeedback()}>Try Again</button>
        </div>
      ) : (
        <div className="feedback-list">
          {filteredFeedbacks.length > 0 ? (
            filteredFeedbacks.map((feedback, index) => {
              const currentStatus = feedback.status || "Awaiting Response";
              const restaurantName = getRestaurantName(feedback);
              const feedbackId = feedback._id || feedback.id || index;

              return (
                <div className="feedback-item" key={feedbackId} style={{ background: "#fff", padding: "16px", borderRadius: "8px", marginBottom: "12px", border: "1px solid #e5e7eb" }}>
                  <div className="feedback-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "16px", color: "#111827" }}>{restaurantName}</strong>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                        ID: {feedback.donationId || "N/A"} | Category: {feedback.category || "General"}
                      </div>
                    </div>
                  </div>

                  <p style={{ marginTop: "10px", color: "#374151", fontSize: "14px" }}>
                    {getMessage(feedback) || "No message provided."}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "8px", borderTop: "1px solid #f3f4f6" }}>
                    <small className="time" style={{ color: "#9ca3af" }}>{feedback.date || "Recent"}</small>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ 
                        padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "600",
                        backgroundColor: currentStatus === "Approved" ? "#d1fae5" : currentStatus === "Declined" ? "#fee2e2" : "#fef3c7",
                        color: currentStatus === "Approved" ? "#065f46" : currentStatus === "Declined" ? "#991b1b" : "#92400e"
                      }}>
                        {currentStatus}
                      </span>

                      <button
                        onClick={() => handleStatusChange(feedback._id || feedback.id, "Approved")}
                        style={{ background: "#10b981", color: "#fff", padding: "5px 12px", borderRadius: "4px", fontSize: "12px", border: "none", cursor: "pointer", fontWeight: "600" }}
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleStatusChange(feedback._id || feedback.id, "Declined")}
                        style={{ background: "#ef4444", color: "#fff", padding: "5px 12px", borderRadius: "4px", fontSize: "12px", border: "none", cursor: "pointer", fontWeight: "600" }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>

                  {/* 👉 নতুন যোগ করা হলো: এডমিন থেকে রেস্টুরেন্টের কাছে ওয়ার্নিং মেসেজ পাঠানোর সেকশন */}
                  <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed #e5e7eb", display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder="Write warning message for restaurant..."
                      id={`warning-msg-${feedbackId}`}
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        borderRadius: "4px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13px"
                      }}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const messageInput = document.getElementById(`warning-msg-${feedbackId}`);
                        const warningMessage = messageInput.value.trim();
                        
                        if (!warningMessage) {
                          alert("দয়া করে আগে ওয়ার্নিং মেসেজটি লিখুন!");
                          return;
                        }

                        try {
                          const recipientUserId = feedback.restaurantUser?._id || feedback.restaurant?._id || feedback.restaurant || feedback.donor;
                          
                          if (!recipientUserId) {
                            alert("দুঃখিত, এই ফিডব্যাকের সাথে কোনো রেস্টুরেন্ট ইউজার আইডি পাওয়া যায়নি।");
                            return;
                          }

                          const response = await sendAdminFeedback({
                            recipientId: recipientUserId,
                            status: feedback.status || "Approved",
                            message: warningMessage
                          });

                          if (response.success) {
                            alert("সফলভাবে রেস্টুরেন্টের কাছে ওয়ার্নিং মেসেজ পাঠানো হয়েছে!");
                            messageInput.value = "";
                          }
                        } catch (err) {
                          console.error("Failed to send warning:", err);
                          alert("মেসেজ পাঠাতে ব্যর্থ হয়েছে।");
                        }
                      }}
                      style={{
                        backgroundColor: "#dc2626",
                        color: "#ffffff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        whiteSpace: "nowrap"
                      }}
                    >
                      Send Warning ⚠️
                    </button>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="feedback-state">No feedback found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Feedback;
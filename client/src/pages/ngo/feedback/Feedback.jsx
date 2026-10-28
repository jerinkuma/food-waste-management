import React, { useEffect, useState } from "react";
import { fetchNgoFeedback, submitFeedback } from "../../../services/api";
import "./Feedback.css";

const NgoFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const ngoId = user._id || user.id;

  const loadNgoFeedbacks = async () => {
    try {
      setLoading(true);
      setError("");

      // ব্যাকএন্ড থেকে যেকোনো ফরম্যাটে ডেটা আসলেও যেন হ্যান্ডেল করতে পারে
      const response = ngoId ? await fetchNgoFeedback(ngoId) : await fetchNgoFeedback();
      
      let list = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (response?.feedback && Array.isArray(response.feedback)) {
        list = response.feedback;
      } else if (response?.feedbacks && Array.isArray(response.feedbacks)) {
        list = response.feedbacks;
      }

      setFeedbacks(list);
    } catch (err) {
      console.error("Failed to load feedback:", err);
      setError("Feedback load করা সম্ভব হয়নি।");
      setFeedbacks([]); // এরর আসলে ফাঁকা অ্যারে রাখবে যেন ক্র্যাশ না করে
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNgoFeedbacks();

    // অ্যাডমিন প্যানেলের সাথে ৫ সেকেন্ড পর পর অটো-সিঙ্ক
    const interval = setInterval(() => {
      loadNgoFeedbacks();
    }, 5000);

    return () => clearInterval(interval);
  }, [ngoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const payload = {
      donationId: formData.get("donationId"),
      donorName: formData.get("donorName") || "cafe24",
      category: formData.get("category"),
      priority: formData.get("priority") || "Normal",
      message: formData.get("message"),
      ngo: ngoId || null,
    };

    try {
      setSubmitting(true);
      const res = await submitFeedback(payload);
      if (res.success || res.feedback) {
        alert("Feedback submitted successfully!");
        e.target.reset();
        loadNgoFeedbacks();
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Feedback submit করতে সমস্যা হয়েছে।");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedlink-container">
      {/* Header Section */}
      <div className="feedlink-header">
        <div className="feedlink-header-title">
          <span className="feedlink-icon">💬</span>
          <div>
            <h2>FEEDBACK & INCIDENT REPORTING</h2>
            <p className="feedlink-header-subtitle">
              Every submission routes to both the Admin panel and the restaurant's own dashboard in real time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="feedlink-grid">
        
        {/* Left Section: Form */}
        <div className="feedlink-card feedlink-form-section">
          <div className="feedlink-section-header">
            <h3>SUBMIT NEW FEEDBACK / REPORT</h3>
            <p>Fill in the form below to register your feedback or report an issue</p>
          </div>

          <form onSubmit={handleSubmit} className="feedlink-form">
            <div className="feedlink-row">
              <div>
                <label className="feedlink-label">Donation ID</label>
                <input
                  type="text"
                  name="donationId"
                  className="feedlink-select"
                  placeholder="e.g. FL-1792340196483-1049"
                  required
                />
              </div>

              <div>
                <label className="feedlink-label">Restaurant / Donor Name</label>
                <input
                  type="text"
                  name="donorName"
                  className="feedlink-select"
                  placeholder="e.g. cafe24"
                  required
                />
              </div>
            </div>

            <div className="feedlink-row">
              <div>
                <label className="feedlink-label">Feedback Category</label>
                <select name="category" className="feedlink-select" required>
                  <option value="General App Feedback">General App Feedback</option>
                  <option value="Food Quality Issue">Food Quality Issue</option>
                  <option value="Late Arrival">Late Arrival</option>
                  <option value="Packaging Damaged">Packaging Damaged</option>
                </select>
              </div>

              <div>
                <label className="feedlink-label">Priority Level</label>
                <div className="feedlink-radio-group" style={{ marginTop: "8px" }}>
                  <label className="feedlink-radio-label">
                    <input type="radio" name="priority" value="Low" className="feedlink-radio" /> Low
                  </label>
                  <label className="feedlink-radio-label">
                    <input type="radio" name="priority" value="Normal" defaultChecked className="feedlink-radio" /> Normal
                  </label>
                  <label className="feedlink-radio-label">
                    <input type="radio" name="priority" value="High / Urgent" className="feedlink-radio" /> High / Urgent
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="feedlink-label">Detailed Message / Incident Description</label>
              <textarea
                name="message"
                rows="4"
                className="feedlink-textarea"
                placeholder="Write your feedback or incident report here in detail..."
                required
              ></textarea>
            </div>

            <div className="feedlink-action-buttons">
              <button type="submit" disabled={submitting} className="feedlink-submit-btn">
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Section: Summary & Status Table */}
        <div className="feedlink-sidebar">
          <div className="feedlink-card feedlink-summary-card">
            <div className="feedlink-summary-header">
              <div>
                <h3>SUBMITTED FEEDBACK SUMMARY</h3>
                <p>Track status of your reported issues & tickets</p>
              </div>
              <span className="feedlink-badge-count">{feedbacks.length} Feedback</span>
            </div>

            {loading ? (
              <p style={{ fontSize: "12px", color: "#64748b" }}>Loading feedback summary...</p>
            ) : error && feedbacks.length === 0 ? (
              <p style={{ fontSize: "12px", color: "#e11d48" }}>{error}</p>
            ) : feedbacks.length === 0 ? (
              <p style={{ fontSize: "12px", color: "#64748b" }}>No feedback submitted yet.</p>
            ) : (
              <div className="feedlink-table-responsive" style={{ maxHeight: "350px", overflowY: "auto" }}>
                <table className="feedlink-table">
                  <thead>
                    <tr>
                      <th className="th-left">Date</th>
                      <th>Restaurant & ID</th>
                      <th>Category</th>
                      <th className="th-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((item, idx) => {
                      const status = item.status || "Awaiting Response";
                      return (
                        <tr key={item._id || item.id || idx} className="feedlink-tr">
                          <td className="td-date">{item.date || "Today"}</td>
                          <td className="td-id">
                            <strong style={{ display: "block", color: "#111827" }}>
                              {item.donorName || "cafe24"}
                            </strong>
                            <span style={{ fontSize: "10px", color: "#6b7280" }}>{item.donationId}</span>
                          </td>
                          <td className="td-category">{item.category}</td>
                          <td>
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "700",
                                display: "inline-block",
                                backgroundColor:
                                  status === "Approved"
                                    ? "#d1fae5"
                                    : status === "Declined"
                                    ? "#fee2e2"
                                    : "#fef3c7",
                                color:
                                  status === "Approved"
                                    ? "#065f46"
                                    : status === "Declined"
                                    ? "#991b1b"
                                    : "#92400e",
                              }}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Support Box */}
          <div className="feedlink-support-box">
            <div className="feedlink-support-title">
              <span>⚠️</span> Need Immediate Assistance?
            </div>
            <p className="feedlink-support-desc">
              For urgent complaints regarding food safety or severe donor issues, directly contact our admin department via email:
            </p>
            <a href="mailto:admin@feedlink.org" className="feedlink-support-link">
              ✉️ admin@feedlink.org
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};

export default NgoFeedback;
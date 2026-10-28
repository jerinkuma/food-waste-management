import React, { useEffect, useState } from "react";
import axiosInstance from "../../../services/api";
import "./Rating.css";

const Rating = () => {
  const [completedDonations, setCompletedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const ngoId = user._id || user.id;

  const loadData = async () => {
    if (!ngoId) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/ratings/ngo/${ngoId}`);
      const donations = res.data?.donations || res.data || [];
      setCompletedDonations(donations);
    } catch (err) {
      console.error("Failed to load donations for rating:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ngoId]);

  const handleOpenRatingModal = (donation) => {
    setSelectedDonation(donation);
    setRatingValue(donation.rating?.score || 5);
    setComment(donation.rating?.comment || "");
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!selectedDonation) return;

    try {
      setSubmitting(true);
      const payload = {
        donationId: selectedDonation.donationId || selectedDonation._id,
        rating: ratingValue,
        comment: comment,
      };

      await axiosInstance.post("/ratings", payload);

      alert("Rating submitted successfully!");
      setSelectedDonation(null);
      loadData();
    } catch (err) {
      console.error("Rating submit error:", err);
      alert("Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ngo-rating-wrapper">
      <div className="ngo-rating-header-box">
        <div className="ngo-rating-title-flex">
          <span className="ngo-rating-big-icon">⭐</span>
          <div>
            <h2>RESTAURANT RATINGS & REVIEWS</h2>
            <p>Rate your completed food pickups directly and share feedback with donors.</p>
          </div>
        </div>
      </div>

      <div className="ngo-rating-main-card">
        <div className="ngo-card-inner-header">
          <h3>Completed Donations History</h3>
          <p>List of completed pickups available for rating</p>
        </div>

        {loading ? (
          <div className="ngo-rating-status-msg">Loading ratings history...</div>
        ) : completedDonations.length === 0 ? (
          <div className="ngo-rating-status-msg">No completed donations found for rating yet.</div>
        ) : (
          <div className="ngo-table-container">
            <table className="ngo-custom-table">
              <thead>
                <tr>
                  <th>Donation ID</th>
                  <th>Food Name</th>
                  <th>Restaurant / Donor</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {completedDonations.map((item, idx) => (
                  <tr key={item._id || idx}>
                    <td className="fw-bold">{item.donationId}</td>
                    <td>{item.foodName}</td>
                    <td>{item.donor?.restaurantName || item.donor?.name || "Unknown Restaurant"}</td>
                    <td>
                      <span className="ngo-status-pill">Completed</span>
                    </td>
                    <td className="rating-star-text">
                      {item.rating?.score ? `★ ${item.rating.score} / 5` : <span className="text-muted">Not Rated</span>}
                    </td>
                    <td className="text-right">
                      <button
                        className="ngo-rate-action-btn"
                        onClick={() => handleOpenRatingModal(item)}
                      >
                        {item.rating?.score ? "Update Rating" : "Rate Donor"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedDonation && (
        <div className="ngo-modal-backdrop">
          <div className="ngo-modal-box">
            <div className="ngo-modal-top">
              <h3>Rate Donor Experience</h3>
              <button className="ngo-modal-close" onClick={() => setSelectedDonation(null)}>×</button>
            </div>
            <p className="ngo-modal-sub-id">Donation ID: {selectedDonation.donationId}</p>

            <form onSubmit={handleSubmitRating}>
              <div className="ngo-form-field">
                <label>Select Rating (1 to 5 Stars)</label>
                <div className="ngo-star-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`ngo-star-item ${ratingValue >= star ? "selected" : ""}`}
                      onClick={() => setRatingValue(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="ngo-form-field" style={{ marginTop: "16px" }}>
                <label>Comment (Optional)</label>
                <textarea
                  rows="3"
                  className="ngo-text-area"
                  placeholder="Write feedback about food quality or pickup..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>

              <div className="ngo-modal-btn-group">
                <button type="submit" disabled={submitting} className="ngo-submit-action-btn">
                  {submitting ? "Submitting..." : "Submit Rating"}
                </button>
                <button type="button" className="ngo-cancel-action-btn" onClick={() => setSelectedDonation(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rating;
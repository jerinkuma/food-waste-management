import React, { useEffect, useState } from "react";
import axiosInstance from "../../../services/api";
import "./Rating.css";

const Rating = () => {
  const [uniqueRestaurants, setUniqueRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // রেস্টুরেন্ট রেটিং ভিউ মোডালের স্টেট
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ngoReceivedRatings, setNgoReceivedRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const ngoId = user._id || user.id;

  const loadData = async () => {
    if (!ngoId) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/ratings/ngo/${ngoId}`);
      const donations = res.data?.donations || res.data || [];
      
      // শুধুমাত্র ইউনিক রেস্টুরেন্টগুলো ফিল্টার করে আলাদা করা (যাতে একই রেস্টুরেন্ট বারবার না আসে)
      const restaurantMap = new Map();
      donations.forEach((item) => {
        const donorId = item.donor?._id || item.donor?.id || item.donor;
        const restName = item.donor?.restaurantName || item.donor?.name || "Unknown Restaurant";
        
        if (donorId && !restaurantMap.has(donorId)) {
          restaurantMap.set(donorId, {
            donorId,
            restaurantName: restName,
            donorEmail: item.donor?.email || "",
            // যদি রেটিং দেওয়া থাকে তা ধরে রাখা
            existingRating: item.rating || null,
            latestDonationId: item.donationId || item._id
          });
        }
      });

      setUniqueRestaurants(Array.from(restaurantMap.values()));
    } catch (err) {
      console.error("Failed to load restaurants for rating:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ngoId]);

  // রেস্টুরেন্ট রেটিং ভিউ ফেচ করার ফাংশন
  const handleOpenRestaurantRatings = async () => {
    if (!ngoId) return;
    setShowRatingModal(true);
    setRatingsLoading(true);
    try {
      const res = await axiosInstance.get(`/ratings/ngo-ratings/${ngoId}`, {
        validateStatus: () => true
      });
      if (res.data && res.data.success) {
        setNgoReceivedRatings(res.data.ratings || []);
      } else {
        setNgoReceivedRatings([]);
      }
    } catch (err) {
      console.error("Error fetching restaurant ratings:", err);
      setNgoReceivedRatings([]);
    } finally {
      setRatingsLoading(false);
    }
  };

  const handleOpenRatingModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setRatingValue(restaurant.existingRating?.score || 5);
    setComment(restaurant.existingRating?.comment || "");
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!selectedRestaurant) return;

    try {
      setSubmitting(true);
      const payload = {
        donationId: selectedRestaurant.latestDonationId,
        rating: ratingValue,
        comment: comment,
      };

      await axiosInstance.post("/ratings", payload);

      alert("Rating submitted successfully!");
      setSelectedRestaurant(null);
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
      <div className="ngo-rating-header-box flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 uppercase">
          RATINGS & REVIEWS
          </h2>
        </div>

        {/* View Restaurant Ratings Button */}
        <button
          onClick={handleOpenRestaurantRatings}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow-lg"
        >
          View Restaurant Ratings
        </button>
      </div>

      <div className="ngo-rating-main-card">
        <div className="ngo-card-inner-header">
          <h3 className="text-lg font-bold text-slate-900">Restaurants List</h3>
        </div>

        {loading ? (
          <div className="ngo-rating-status-msg">Loading restaurants...</div>
        ) : uniqueRestaurants.length === 0 ? (
          <div className="ngo-rating-status-msg">No restaurants found yet.</div>
        ) : (
          <div className="ngo-table-container">
            <table className="ngo-custom-table">
              <thead>
                <tr>
                  <th>Restaurant Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {uniqueRestaurants.map((item, idx) => (
                  <tr key={item.donorId || idx}>
                    <td className="fw-bold">{item.restaurantName}</td>
                    <td>{item.donorEmail || "N/A"}</td>
                    <td>
                      <span className="ngo-status-pill">Active </span>
                    </td>
                    <td className="rating-star-text">
                      {item.existingRating?.score ? `★ ${item.existingRating.score} / 5` : <span className="text-muted">Not Rated</span>}
                    </td>
                    <td className="text-right">
                      <button
                        className="ngo-rate-action-btn"
                        onClick={() => handleOpenRatingModal(item)}
                      >
                        {item.existingRating?.score ? "Update Rating" : "Rate Donor"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* রেটিং সাবমিট করার মোডাল */}
      {selectedRestaurant && (
        <div className="ngo-modal-backdrop">
          <div className="ngo-modal-box">
            <div className="ngo-modal-top">
              <h3>Rate Restaurant: {selectedRestaurant.restaurantName}</h3>
              <button className="ngo-modal-close" onClick={() => setSelectedRestaurant(null)}>×</button>
            </div>
            <p className="ngo-modal-sub-id"> Email: {selectedRestaurant.donorEmail || "N/A"}</p>

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
                  placeholder="Write feedback about partnership or food quality..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>

              <div className="ngo-modal-btn-group">
                <button type="submit" disabled={submitting} className="ngo-submit-action-btn">
                  {submitting ? "Submitting..." : "Submit Rating"}
                </button>
                <button type="button" className="ngo-cancel-action-btn" onClick={() => setSelectedRestaurant(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* রেস্টুরেন্ট রেটিং ভিউ মোডাল */}
      {showRatingModal && (
        <div className="ngo-modal-backdrop">
          <div className="ngo-modal-box max-w-lg w-full bg-slate-900 border border-slate-800 text-slate-100 p-6 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="ngo-modal-top flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Restaurants Rating You</h3>
              <button className="ngo-modal-close text-slate-400 hover:text-white text-xl cursor-pointer" onClick={() => setShowRatingModal(false)}>×</button>
            </div>

            {ratingsLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading restaurant ratings...</div>
            ) : ngoReceivedRatings.length === 0 ? (
              <div className="bg-slate-950 p-6 rounded-xl text-center border border-slate-800">
                <p className="text-slate-300 text-xs">No ratings received yet from restaurants.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ngoReceivedRatings.map((r, idx) => {
                  const restName = r.restaurantName || r.restaurantId?.name || r.restaurantId?.restaurantName || "Restaurant Partner";
                  const restEmail = r.restaurantEmail || r.restaurantId?.email || "";
                  return (
                    <div key={r._id || idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-white">{restName}</h4>
                          <p className="text-[11px] text-slate-400">{restEmail}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 text-amber-400 font-bold text-xs">
                          ★ {r.rating || 0} / 5.0
                        </div>
                      </div>
                      {r.review && (
                        <p className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60 mt-1">
                          "{r.review}"
                        </p>
                      )}
                      <div className="flex justify-end items-center text-[10px] text-slate-500 mt-1">
                        <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button 
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold text-xs transition cursor-pointer shadow-lg" 
              onClick={() => setShowRatingModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rating;
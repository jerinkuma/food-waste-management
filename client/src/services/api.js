import axios from "axios";
import { API_URL } from "../config";
import { authHeader } from "./auth";

const client = axios.create({ baseURL: API_URL });

// Attach the JWT (when present) to every request automatically.
client.interceptors.request.use((config) => {
  config.headers = { ...config.headers, ...authHeader() };
  return config;
});

// =====================================================================
// DONATIONS
// =====================================================================

// NGO browse pool - all donations still waiting to be claimed.
export const fetchAvailableDonations = async (lat, lng) => {
  const params = {};
  if (lat != null && lng != null) {
    params.lat = lat;
    params.lng = lng;
  }
  const { data } = await client.get("/donations/available", { params });
  return data.donations || [];
};

// NGO accepts a donation -> Pending -> Accepted
export const acceptDonation = async (donationId, ngoId) => {
  const { data } = await client.put(`/donations/${donationId}/accept`, { ngoId });
  return data;
};

export const assignDeliveryDriver = async (
  donationId,
  name,
  phone,
  vehicleNumber
) => {
  const { data } = await client.put(
    `/donations/${donationId}/assign-driver`,
    {
      name,
      phone,
      vehicleNumber,
    }
  );

  return data;
};

// Advance the pipeline: Accepted -> Out for Delivery -> Completed (or Rejected)
export const updateDonationStatus = async (donationId, status, note, updatedBy) => {
  const { data } = await client.put(`/donations/${donationId}/status`, { status, note, updatedBy });
  return data;
};

// An NGO's own donations, split into active pickups + archived history
export const fetchNgoDonations = async (ngoId) => {
  const { data } = await client.get(`/donations/ngo/${ngoId}`);
  return data; // { active, archived, count }
};

// Completed donations owned by the authenticated NGO.
export const fetchNgoCompletedDonations = async () => {
  const { data } = await client.get("/ngo/completed-donations");
  return data.donations || [];
};

// A restaurant's own posted donations (donor = User id)
export const fetchRestaurantDonations = async (donorUserId) => {
  const { data } = await client.get(`/donations/donor/${donorUserId}`);
  return data.donations || [];
};

export const fetchDonorDashboard = async (donorUserId) => {
  const { data } = await client.get(`/donations/dashboard/${donorUserId}`);
  return data.dashboard || data;
};


// Fetch NGO-wise analytics for the logged-in donor
export const fetchDonorNgoAnalytics = async (donorUserId) => {
  const { data } = await client.get(
    `/donations/donor/${donorUserId}/ngo-analytics`
  );

  return data.analytics;
};

export const createDonation = async (payload) => {
  const { data } = await client.post("/donations", payload);
  return data;
};

// Submit NGO distribution proof.
// Uses the shared Axios client, API_URL and JWT interceptor.
export const submitDistributionProof = async (payload) => {
  const { data } = await client.post(
    "/ngo/submit-distribution",
    payload
  );

  return data;
};

// =====================================================================
// NGO PROFILE
// =====================================================================
export const fetchNgoProfile = async () => {
  const { data } = await client.get("/ngo/profile");
  return data.ngo;
};

export const fetchNgoStats = async () => {
  const { data } = await client.get("/ngo/stats");
  return data.stats;
};

// =====================================================================
// RESTAURANT PROFILE
// =====================================================================
export const fetchRestaurantProfile = async (userId) => {
  const { data } = await client.get(`/restaurants/profile/${userId}`);
  return data.restaurant;
};

// =====================================================================
// FOLLOW / PARTNER SYSTEM
// =====================================================================
export const fetchSuggestedPartners = async (userId, role) => {
  const { data } = await client.get(`/partners/suggestions/${userId}`, { params: { role } });
  return data.suggestions || [];
};

export const fetchFollowing = async (userId) => {
  const { data } = await client.get(`/partners/following/${userId}`);
  return data.following || [];
};

export const fetchFollowers = async (userId) => {
  const { data } = await client.get(`/partners/followers/${userId}`);
  return data.followers || [];
};

export const followPartner = async (followerId, followerRole, followingId, followingRole) => {
  const { data } = await client.post("/partners/follow", { followerId, followerRole, followingId, followingRole });
  return data;
};

export const unfollowPartner = async (followerId, followerRole, followingId, followingRole) => {
  const { data } = await client.post("/partners/unfollow", { followerId, followerRole, followingId, followingRole });
  return data;
};

// =====================================================================
// DUAL-DESTINATION FEEDBACK
// =====================================================================
export const submitFeedback = async (payload) => {
  const { data } = await client.post("/feedback", payload);
  return data;
};

export const fetchAdminFeedback = async () => {
  const { data } = await client.get("/feedback/admin");
  return data.feedback || [];
};

export const fetchRestaurantFeedback = async (restaurantUserId) => {
  const { data } = await client.get(`/feedback/restaurant/${restaurantUserId}`);
  return data.feedback || [];
};

export const fetchNgoFeedback = async (ngoId) => {
  const { data } = await client.get(`/feedback/ngo/${ngoId}`);
  return data.feedback || [];
};

export const respondToFeedback = async (feedbackId, message) => {
  const { data } = await client.put(`/feedback/${feedbackId}/respond`, { message });
  return data;
};

// 👉 অ্যাডমিন ফিডব্যাক স্ট্যাটাস পরিবর্তন করার জন্য (Approve / Decline)
export const updateFeedbackStatus = async (feedbackId, status) => {
  const { data } = await client.patch(`/feedback/${feedbackId}/status`, { status });
  return data;
};

export const markFeedbackRead = async (feedbackId, viewer) => {
  const { data } = await client.patch(`/feedback/${feedbackId}/read`, {}, { params: { viewer } });
  return data;
};

export const submitDonorFeedback = async (payload) => {
  const { data } = await client.post("/feedback/donor", payload);
  return data;
};


export const submitDonorNgoRating = async (payload) => {
  const { data } = await client.post(
    "/feedback/donor/rating",
    payload
  );

  return data;
};


export const fetchDonorNgoReviews = async () => {
  const { data } = await client.get("/feedback/donor/ngo-reviews");
  return data;
};

export const fetchDonorDistributionProofs = async () => {
  const { data } = await client.get(
    "/ngo/donor/distribution-proofs"
  );

  return data.proofs || [];
};

// =====================================================================
// CONTACT MESSAGES
// =====================================================================

// Public contact form submission
export const submitContactMessage = async (payload) => {
  const { data } = await client.post("/contact", payload);
  return data;
};

// Admin: Fetch all contact messages with optional search and status filter
export const fetchAdminContactMessages = async (params = {}) => {
  const { data } = await client.get("/admin/contact-messages", {
    params,
  });

  return data.messages || [];
};

// Admin: Fetch unread contact message count
export const fetchAdminUnreadContactCount = async () => {
  const { data } = await client.get(
    "/admin/contact-messages/unread-count"
  );

  return data.unreadCount || 0;
};

// Admin: Update message status
export const updateContactMessageStatus = async (messageId, status) => {
  const { data } = await client.patch(
    `/admin/contact-messages/${messageId}/status`,
    { status }
  );

  return data;
};

// Admin: Reply to visitor
export const replyToContactMessage = async (messageId, message) => {
  const { data } = await client.post(
    `/admin/contact-messages/${messageId}/reply`,
    { message }
  );

  return data;
};

// =====================================================================
// ADMIN (Real Backend Connections)
// =====================================================================
export const fetchDashboardStats = async () => {
  const { data } = await client.get("/admin/dashboard-stats");
  return data;
};

export const fetchUsers = async () => {
  const { data } = await client.get("/admin/users");
  return data;
};

export const updateUserStatus = async (userId, status) => {
  const { data } = await client.put(`/admin/users/${userId}/status`, { status });
  return data;
};

export const fetchDonations = async () => {
  const { data } = await client.get("/admin/donations");
  return data;
};

export const fetchOrphanages = async () => {
  const { data } = await client.get("/admin/ngos");
  return data;
};

export const fetchFeedback = async () => {
  const { data } = await client.get("/feedback/admin");
  return data.feedback || [];
};

export const fetchInventory = async () => {
  const { data } = await client.get("/admin/donations");
  return data;
};

// 👉 Step 2: এডমিন থেকে রেস্টুরেন্টের কাছে ওয়ার্নিং পাঠানোর API কল
// Admin: Send warning notification to Donor / NGO
export const sendAdminFeedback = async (payload) => {
  const { data } = await client.post("/feedback/admin", payload);
  return data;
};



// =====================================
// ADVANCED REPORTS & ANALYTICS
// =====================================
export const fetchAdvancedReports = async (year, month = null) => {
  const params = { year };

  if (month !== null && month !== "") {
    params.month = month;
  }

  const { data } = await client.get("/admin/advanced-reports", {
    params,
  });

  return data;
};
export default client;
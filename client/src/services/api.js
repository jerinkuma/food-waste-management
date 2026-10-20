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

// A restaurant's own posted donations (donor = User id)
export const fetchRestaurantDonations = async (donorUserId) => {
  const { data } = await client.get(`/donations/donor/${donorUserId}`);
  return data.donations || [];
};

export const fetchDonorDashboard = async (donorUserId) => {
  const { data } = await client.get(`/donations/dashboard/${donorUserId}`);
  return data.dashboard;
};

export const createDonation = async (payload) => {
  const { data } = await client.post("/donations", payload);
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
  const { data } = await client.get(`/follow/suggestions/${userId}`, { params: { role } });
  return data.suggestions || [];
};

export const fetchFollowing = async (userId) => {
  const { data } = await client.get(`/follow/following/${userId}`);
  return data.following || [];
};

export const fetchFollowers = async (userId) => {
  const { data } = await client.get(`/follow/followers/${userId}`);
  return data.followers || [];
};

export const followPartner = async (followerId, followerRole, followingId, followingRole) => {
  const { data } = await client.post("/follow", { followerId, followerRole, followingId, followingRole });
  return data;
};

export const unfollowPartner = async (followerId, followerRole, followingId, followingRole) => {
  const { data } = await client.delete("/follow", { data: { followerId, followerRole, followingId, followingRole } });
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

export const markFeedbackRead = async (feedbackId, viewer) => {
  const { data } = await client.patch(`/feedback/${feedbackId}/read`, {}, { params: { viewer } });
  return data;
};

// =====================================================================
// ADMIN (Static Fallback / Mock Data as requested)
// =====================================================================
// =====================================
// ADMIN DASHBOARD STATS
// Fetch real statistics from backend
// =====================================
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
  return data;
};



export const fetchInventory = async () => {
  const { data } = await client.get("/admin/donations");
  return data;
};


export default client;
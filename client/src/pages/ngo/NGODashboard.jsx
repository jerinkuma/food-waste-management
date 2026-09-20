import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  Utensils,
  HeartHandshake,
  Star,
  Map as MapIcon,
  Maximize2,
  Truck,
  Check,
  X,
  ArrowRight,
} from "lucide-react";

import { Map as PigeonMap, Marker } from "pigeon-maps";
import { getSocket } from "../../services/socket";
import { getCurrentUser } from "../../services/auth";
import {
  fetchNgoStats,
  fetchNgoProfile,
  fetchAvailableDonations,
  acceptDonation,
  updateDonationStatus,
} from "../../services/api";

export default function NGODashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [stats, setStats] = useState({
    totalClaimed: 0,
    mealsDistributed: 0,
    trustScore: 0,
    foodWasteSaved: "0 Kg",
  });
  const [requests, setRequests] = useState([]);
  const [ngoId, setNgoId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      const [statsData, profile] = await Promise.all([
        fetchNgoStats().catch(() => null),
        fetchNgoProfile().catch(() => null),
      ]);
      if (statsData) setStats(statsData);
      setNgoId(profile?._id || null);

      navigator.geolocation?.getCurrentPosition(
        async (pos) => setRequests(await fetchAvailableDonations(pos.coords.latitude, pos.coords.longitude)),
        async () => setRequests(await fetchAvailableDonations()),
        { timeout: 4000 }
      );
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    // Real-time: new donations & status changes refresh this view instantly
    const socket = getSocket();
    socket.on("donation:new", loadDashboard);
    socket.on("donation:updated", loadDashboard);
    return () => {
      socket.off("donation:new", loadDashboard);
      socket.off("donation:updated", loadDashboard);
    };
  }, [loadDashboard]);

  const handleAccept = async (donationId) => {
    if (!ngoId) {
      alert("Your NGO profile could not be verified. Please log in again.");
      return;
    }
    setBusyId(donationId);
    try {
      await acceptDonation(donationId, ngoId);
      alert("Request accepted successfully! Moved to Active Pickups.");
      await loadDashboard();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to accept request");
    } finally {
      setBusyId(null);
    }
  };

  const handleDecline = async (donationId) => {
    setBusyId(donationId);
    try {
      await updateDonationStatus(donationId, "Rejected", "Declined from dashboard", user?.id);
      await loadDashboard();
    } catch (err) {
      console.error("Failed to reject request", err);
    } finally {
      setBusyId(null);
    }
  };

  const displayedRequests = requests.slice(0, 2);
  const goToMap = () => navigate("/ngo/donation-map");

  return (
    <div className="space-y-6">
      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Claimed</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalClaimed}</h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
              <Utensils className="w-6 h-6" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              +{stats.todayClaimed || 0} Today
            </span>
            <span className="text-slate-400">Live</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400">Meals Distributed</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.mealsDistributed}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
              <HeartHandshake className="w-6 h-6" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
              +{stats.todayMeals || 0} Meals
            </span>
            <span className="text-slate-400">Live</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400">Trust Score</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {stats.trustScore} <span className="text-amber-400 text-xl">★</span>
              </h3>
            </div>
            <div className="p-3 bg-amber-100 text-amber-500 rounded-2xl">
              <Star className="w-6 h-6 fill-amber-500" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
              {stats.reviewCount || 0} Reviews
            </span>
            <span className="text-slate-400">Live</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400">Food Waste Saved</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.foodWasteSaved}</h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
              <Utensils className="w-6 h-6" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              Saved from completed pickups
            </span>
            <span className="text-slate-400">Live</span>
          </div>
        </div>
      </div>

      {/* ================= MAP + ACTIVE REQUESTS ================= */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                NEARBY FOOD <span className="text-slate-500 font-normal">(Live Locations)</span>
              </h3>
            </div>
            <button onClick={goToMap} className="text-slate-400 hover:text-emerald-600 p-1 cursor-pointer" title="Open Full Map View">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div onClick={goToMap} className="relative w-full h-80 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group">
            <PigeonMap defaultCenter={[22.3569, 91.7832]} defaultZoom={12}>
              {requests
                .filter((r) => r.resolvedLocation)
                .map((r) => (
                  <Marker key={r._id} width={36} anchor={[r.resolvedLocation.lat, r.resolvedLocation.lng]} color="#059669" />
                ))}
            </PigeonMap>

            <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/20 transition-all flex items-center justify-center">
              <span className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-full text-xs font-bold text-slate-800 shadow-lg">
                📍 Click to Open Donation Map View
              </span>
            </div>
          </div>
        </div>

        <div className="col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-900 text-sm">ACTIVE REQUESTS</h3>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {requests.length} Total
              </span>
            </div>

            <div className="space-y-3">
              {displayedRequests.map((req) => (
                <div key={req._id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{req.donor?.name || "Restaurant"}</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Truck className="w-3 h-3 text-rose-500" />
                        {req.foodName}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {req.distanceKm != null ? `${req.distanceKm} km` : ""}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-white p-1.5 rounded border border-slate-100">
                    {req.pickupAddress || "No address provided"}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      disabled={busyId === req._id}
                      onClick={() => handleAccept(req._id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> ACCEPT
                    </button>
                    <button
                      disabled={busyId === req._id}
                      onClick={() => handleDecline(req._id)}
                      className="flex-1 bg-rose-700 hover:bg-rose-800 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> DECLINE
                    </button>
                  </div>
                </div>
              ))}

              {displayedRequests.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-sm text-slate-400">No active donation requests.</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={goToMap}
            className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>SEE ALL ACTIVE REQUESTS ({requests.length})</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
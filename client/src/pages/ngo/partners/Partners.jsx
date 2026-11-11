import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../../services/api";
import { getCurrentUser } from "../../../services/auth";
import { getSocket } from "../../../services/socket";
import { Handshake, Users, UserCheck, UserPlus, Package, MapPin, Mail, X, Star, History, Search } from "lucide-react";
import './Partners.css';

const initials = (name = '') =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function Partners() {
  const user = getCurrentUser() || JSON.parse(localStorage.getItem("user") || "{}");
  const [tab, setTab] = useState('discover'); // discover | following
  const [suggestions, setSuggestions] = useState([]);
  const [following, setFollowing] = useState([]);
  const [partnersError, setPartnersError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // পার্টনার ডিটেইলস, লাইভ ইনভেন্টরি, হিস্ট্রি ও রেটিং স্টেট
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerDetailsLoading, setPartnerDetailsLoading] = useState(false);
  const [liveDonations, setLiveDonations] = useState([]);
  const [pastDonations, setPastDonations] = useState([]);
  const [partnerRatings, setPartnerRatings] = useState([]);

  const loadAll = useCallback(async () => {
    const currentUserId = user?.id || user?._id;
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setPartnersError("");

    try {
      const [suggRes, followRes] = await Promise.all([
        axiosInstance.get(`/partners/suggestions/${currentUserId}`, { 
          params: { role: user.role || 'ngo' },
          validateStatus: () => true 
        }),
        axiosInstance.get(`/partners/following/${currentUserId}`, { 
          validateStatus: () => true 
        }),
      ]);

      const suggData = suggRes.data?.suggestions || suggRes.data?.data || suggRes.data || [];
      const followData = followRes.data?.following || followRes.data?.data || followRes.data || [];

      setSuggestions(Array.isArray(suggData) ? suggData : []);
      setFollowing(Array.isArray(followData) ? followData : []);

    } catch (error) {
      console.error("Error loading partners:", error);
      setPartnersError("Could not load partners data.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?._id, user?.role]);

  useEffect(() => {
    loadAll();

    const handleCustomEvent = () => loadAll();
    window.addEventListener("partner_status_changed", handleCustomEvent);

    const socket = getSocket();
    if (socket) {
      const onFollow = () => loadAll();
      socket.on('follow:new', onFollow);
      socket.on('follow:removed', onFollow);
      return () => {
        window.removeEventListener("partner_status_changed", handleCustomEvent);
        socket.off('follow:new', onFollow);
        socket.off('follow:removed', onFollow);
      };
    }

    return () => {
      window.removeEventListener("partner_status_changed", handleCustomEvent);
    };
  }, [loadAll]);

  const isFollowing = (targetUserId) => {
    if (!targetUserId || !Array.isArray(following)) return false;
    return following.some((f) => {
      const fId = f.following?._id || f.followingId || f.following || f._id || f.userId;
      return String(fId) === String(targetUserId);
    });
  };

  const handleFollow = async (targetId, targetRole) => {
    const currentUserId = user?.id || user?._id;
    setBusyId(targetId);
    try {
      await axiosInstance.post("/partners/follow", {
        followerId: currentUserId,
        followerRole: user.role || 'ngo',
        followingId: targetId,
        followingRole: targetRole || 'donor'
      });
      await loadAll();
    } catch (error) {
      alert(error?.response?.data?.message || 'Could not follow this partner.');
    } finally {
      setBusyId(null);
    }
  };

  const handleUnfollow = async (targetId, targetRole) => {
    const currentUserId = user?.id || user?._id;
    setBusyId(targetId);
    try {
      await axiosInstance.post("/partners/unfollow", {
        followerId: currentUserId,
        followerRole: user.role || 'ngo',
        followingId: targetId,
        followingRole: targetRole || 'donor'
      });
      await loadAll();
    } catch (error) {
      console.error(error);
    } finally {
      setBusyId(null);
    }
  };

  const handleOpenPartnerDetails = async (targetId) => {
    if (!targetId) return;
    setPartnerDetailsLoading(true);
    try {
      const res = await axiosInstance.get(`/partners/details/${targetId}`, {
        validateStatus: () => true
      });

      if (res.data && res.data.success) {
        setSelectedPartner(res.data.partner);
        setLiveDonations(res.data.liveDonations || []);
        setPastDonations(res.data.pastDonations || []);
        setPartnerRatings(res.data.ratings || []);
      } else {
        alert(res.data?.message || "Failed to load partner details.");
      }
    } catch (error) {
      console.error("Error fetching partner details:", error);
      alert("Could not fetch partner details.");
    } finally {
      setPartnerDetailsLoading(false);
    }
  };

  const oppositeLabel = user?.role === 'ngo' ? 'Restaurants' : 'NGOs';

  // ফিল্টার লিস্ট (সার্চ কোয়েরি অনুযায়ী)
  const filteredSuggestions = suggestions.filter(s => {
    const name = s.name || s.restaurantName || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredFollowing = following.filter(f => {
    const name = f.following?.name || f.name || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderCard = (item, { targetId, targetRole, name, meta, mutual }) => {
    const currentlyFollowing = isFollowing(targetId);

    return (
      <div className="pt-card" key={targetId}>
        <div onClick={() => handleOpenPartnerDetails(targetId)} style={{ cursor: 'pointer' }}>
          <div className="pt-avatar">{initials(name)}</div>
          <p className="pt-name">{name}</p>
          <p className="pt-meta">{meta || "Verified Partner"}</p>
          {mutual && (
            <span className="pt-partner-badge">
              <Handshake className="w-3 h-3" style={{ display: 'inline', marginRight: 4 }} /> Official Partner
            </span>
          )}
        </div>
        
        <button
          disabled={busyId === targetId}
          className={`pt-follow-btn ${currentlyFollowing ? 'following' : 'not-following'}`}
          onClick={(e) => {
            e.stopPropagation();
            currentlyFollowing ? handleUnfollow(targetId, targetRole) : handleFollow(targetId, targetRole);
          }}
        >
          {currentlyFollowing ? (
            <>
              <UserCheck className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: 4 }} /> Unfollow
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: 4 }} /> Follow
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 w-full min-h-screen text-slate-100">
      {partnersError && (
        <div className="mb-4 p-3.5 rounded-xl text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/30">
          {partnersError}
        </div>
      )}

      {/* Header & Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" />
            Partners
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Follow {oppositeLabel.toLowerCase()} to build lasting donation partnerships.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search partner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition w-44 md:w-52"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dynamic Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button 
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${tab === 'discover' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`} 
              onClick={() => setTab('discover')}
            >
              Discover
            </button>
            <button 
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${tab === 'following' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`} 
              onClick={() => setTab('following')}
            >
              Following ({following.length})
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center text-slate-400 font-medium text-sm">
          Loading partners...
        </div>
      ) : tab === 'discover' ? (
        filteredSuggestions.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 p-16 rounded-2xl text-center shadow-xl">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-medium text-sm">No new {oppositeLabel.toLowerCase()} to suggest right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredSuggestions.map((s) =>
              renderCard(s, { 
                targetId: s.userId || s._id, 
                targetRole: s.role || 'donor', 
                name: s.name || s.restaurantName || "Restaurant Partner", 
                meta: s.address || s.email || '' 
              })
            )}
          </div>
        )
      ) : filteredFollowing.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 p-16 rounded-2xl text-center shadow-xl">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium text-sm">You aren't following anyone yet — check the Discover tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredFollowing.map((f) =>
            renderCard(f, {
              targetId: f.following?._id || f.followingId || f.following || f._id,
              targetRole: f.followingRole || 'donor',
              name: f.following?.name || f.name || "Restaurant",
              meta: f.following?.email || f.email || "",
              mutual: f.isMutualPartner,
            })
          )}
        </div>
      )}

      {/* পার্টনার প্রোফাইল, লাইভ ইনভেন্টরি, রেটিং ও পাস্ট হিস্ট্রি মডাল */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer" 
              onClick={() => setSelectedPartner(null)}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-4 mb-5">
              <div className="w-14 h-14 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center font-bold text-lg border border-emerald-500/30 shadow-xs shrink-0">
                {initials(selectedPartner.name)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedPartner.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" /> {selectedPartner.email}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {selectedPartner.address || "Location not provided"}
                </p>
              </div>
            </div>

            {/* রেটিং ও এভারেজ স্কোর সেকশন */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl flex items-center gap-2 mb-6">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-amber-200">
                Rating: {selectedPartner.averageRating || '0.0'} / 5.0
              </span>
              <span className="text-xs text-slate-400">({selectedPartner.totalRatings || 0} reviews)</span>
            </div>

            {partnerDetailsLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading partner details...</div>
            ) : (
              <div className="space-y-6">
                {/* লাইভ ইনভেন্টরি সেকশন */}
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-400" /> Live Inventory (Active Donations)
                  </h4>
                  {liveDonations.length === 0 ? (
                    <p className="text-slate-500 text-xs bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                      No active food donations right now from this partner.
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {liveDonations.map((donation) => (
                        <div key={donation._id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                          <div className="flex justify-between items-center text-xs font-semibold text-white">
                            <span>{donation.foodName || donation.title || 'Food Donation'}</span>
                            <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                              {donation.quantity || 'N/A'} KG
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-1">{donation.description || 'No description provided.'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* পাস্ট ডোনেশন হিস্ট্রি সেকশন */}
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-400" /> Past Donation History (Completed)
                  </h4>
                  {pastDonations.length === 0 ? (
                    <p className="text-slate-500 text-xs bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                      No completed donation history yet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {pastDonations.map((item) => (
                        <div key={item._id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                          <span className="text-slate-300 font-medium">
                            {item.foodName || item.title || item.foodTitle || item.name || 'Donation Item'} ({item.quantity || item.qty || 'N/A'} KG)
                          </span>
                          <span className="text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Completed
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button 
              className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-semibold text-xs transition cursor-pointer" 
              onClick={() => setSelectedPartner(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
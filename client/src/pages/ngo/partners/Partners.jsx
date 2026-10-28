import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../../services/api";
import { getCurrentUser } from "../../../services/auth";
import { getSocket } from "../../../services/socket";
import { Handshake, Users, UserCheck, UserPlus, Package, MapPin, Mail, X, Star, History } from "lucide-react";
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
  const [tab, setTab] = useState('discover'); // discover | following | followers
  const [suggestions, setSuggestions] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [partnersError, setPartnersError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

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
      const [suggRes, followRes, followerRes] = await Promise.all([
        axiosInstance.get(`/partners/suggestions/${currentUserId}`, { 
          params: { role: user.role || 'ngo' },
          validateStatus: () => true 
        }),
        axiosInstance.get(`/partners/following/${currentUserId}`, { 
          validateStatus: () => true 
        }),
        axiosInstance.get(`/partners/followers/${currentUserId}`, { 
          validateStatus: () => true 
        }),
      ]);

      const suggData = suggRes.data?.suggestions || suggRes.data?.data || suggRes.data || [];
      const followData = followRes.data?.following || followRes.data?.data || followRes.data || [];
      const followerData = followerRes.data?.followers || followerRes.data?.data || followerRes.data || [];

      setSuggestions(Array.isArray(suggData) ? suggData : []);
      setFollowing(Array.isArray(followData) ? followData : []);
      setFollowers(Array.isArray(followerData) ? followerData : []);

    } catch (error) {
      console.error("Error loading partners:", error);
      setPartnersError("Could not load partners data.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?._id, user?.role]);

  // সার্চ মডাল ও সকেট থেকে রিয়েল-টাইম অটো-রিফ্রেশ হ্যান্ডলার
  useEffect(() => {
    loadAll();

    // সার্চ মডাল থেকে ফলো দিলে যেন সাথে সাথে লিস্ট আপডেট হয়
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

  const renderCard = (item, { targetId, targetRole, name, meta, mutual }) => {
    const currentlyFollowing = isFollowing(targetId);

    return (
      <div className="pt-card" key={targetId}>
        <div onClick={() => handleOpenPartnerDetails(targetId)} style={{ cursor: 'pointer' }}>
          <div className="pt-avatar">{initials(name)}</div>
          <p className="pt-name">{name}</p>
          <p className="pt-meta">{meta}</p>
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
    <div className="pt-container">
      {partnersError && <div className="pt-error-banner" style={{ color: 'red', marginBottom: '15px' }}>{partnersError}</div>}
      <div className="pt-header">
        <div>
          <h2 className="pt-title">PARTNERS & CONNECTIONS</h2>
          <p className="pt-subtitle">Follow {oppositeLabel.toLowerCase()} to build lasting donation partnerships</p>
        </div>
        <div className="pt-tabs">
          <button className={`pt-tab ${tab === 'discover' ? 'pt-tab-active' : ''}`} onClick={() => setTab('discover')}>
            Discover
          </button>
          <button className={`pt-tab ${tab === 'following' ? 'pt-tab-active' : ''}`} onClick={() => setTab('following')}>
            Following ({following.length})
          </button>
          <button className={`pt-tab ${tab === 'followers' ? 'pt-tab-active' : ''}`} onClick={() => setTab('followers')}>
            Followers ({followers.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="pt-empty">Loading partners...</div>
      ) : tab === 'discover' ? (
        !Array.isArray(suggestions) || suggestions.length === 0 ? (
          <div className="pt-empty">
            <Users className="w-6 h-6" style={{ margin: '0 auto 8px' }} />
            No new {oppositeLabel.toLowerCase()} to suggest right now.
          </div>
        ) : (
          <div className="pt-grid">
            {suggestions.map((s) =>
              renderCard(s, { 
                targetId: s.userId || s._id, 
                targetRole: s.role || 'donor', 
                name: s.name || s.restaurantName || "Restaurant Partner", 
                meta: s.address || s.email || '' 
              })
            )}
          </div>
        )
      ) : tab === 'following' ? (
        !Array.isArray(following) || following.length === 0 ? (
          <div className="pt-empty">You aren't following anyone yet — check the Discover tab.</div>
        ) : (
          <div className="pt-grid">
            {following.map((f) =>
              renderCard(f, {
                targetId: f.following?._id || f.followingId || f.following || f._id,
                targetRole: f.followingRole || 'donor',
                name: f.following?.name || f.name || "Restaurant",
                meta: f.following?.email || f.email || "",
                mutual: f.isMutualPartner,
              })
            )}
          </div>
        )
      ) : !Array.isArray(followers) || followers.length === 0 ? (
        <div className="pt-empty">No one is following you yet.</div>
      ) : (
        <div className="pt-grid">
          {followers.map((f) => {
            const fUserId = f.following?._id || f.followingId || f.following || f.follower?._id || f._id;
            const fName = f.following?.name || f.follower?.name || f.name || "Partner";
            const fEmail = f.following?.email || f.follower?.email || f.email || "";
            return (
              <div className="pt-card" key={f._id || fUserId} onClick={() => handleOpenPartnerDetails(fUserId)} style={{ cursor: 'pointer' }}>
                <div className="pt-avatar">{initials(fName)}</div>
                <p className="pt-name">{fName}</p>
                <p className="pt-meta">{fEmail}</p>
                {f.isMutualPartner && (
                  <span className="pt-partner-badge">
                    <Handshake className="w-3 h-3" style={{ display: 'inline', marginRight: 4 }} /> Official Partner
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* পার্টনার প্রোফাইল, লাইভ ইনভেন্টরি, রেটিং ও পাস্ট হিস্ট্রি মডাল */}
      {selectedPartner && (
        <div className="pt-modal-overlay">
          <div className="pt-modal-content">
            <button className="pt-modal-close" onClick={() => setSelectedPartner(null)}>
              <X className="w-5 h-5" />
            </button>

            <div className="pt-modal-header">
              <div className="pt-avatar" style={{ width: '52px', height: '52px', fontSize: '20px' }}>
                {initials(selectedPartner.name)}
              </div>
              <div>
                <h3 className="pt-modal-title">{selectedPartner.name}</h3>
                <p className="pt-modal-text">
                  <Mail className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: 6 }} /> {selectedPartner.email}
                </p>
                <p className="pt-modal-text">
                  <MapPin className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: 6 }} /> {selectedPartner.address}
                </p>
              </div>
            </div>

            {/* রেটিং ও এভারেজ স্কোর সেকশন */}
            <div className="pt-rating-box">
              <Star className="w-4 h-4" style={{ color: '#d97706', fill: '#d97706' }} />
              <span>Rating: {selectedPartner.averageRating || '0.0'} / 5.0</span>
              <span style={{ color: '#78350f', fontWeight: 'normal', fontSize: '0.8rem' }}>({selectedPartner.totalRatings || 0} reviews)</span>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />

            {partnerDetailsLoading ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>Loading partner details...</p>
            ) : (
              <>
                {/* লাইভ ইনভেন্টরি সেকশন */}
                <h4 className="pt-section-title">
                  <Package className="w-4 h-4 text-green-600" /> Live Inventory (Active Donations)
                </h4>
                {liveDonations.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>No active food donations right now from this partner.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {liveDonations.map((donation) => (
                      <div key={donation._id} className="pt-inventory-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>
                          <span>{donation.foodName || donation.title || 'Food Donation'}</span>
                          <span style={{ color: '#059669' }}>Qty: {donation.quantity || 'N/A'}</span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#475569' }}>{donation.description || 'No description provided.'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* পাস্ট ডোনেশন হিস্ট্রি সেকশন */}
                <h4 className="pt-section-title">
                  <History className="w-4 h-4 text-blue-600" /> Past Donation History (Completed)
                </h4>
                {pastDonations.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '10px' }}>No completed donation history yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                    {pastDonations.map((item) => (
                      <div key={item._id} className="pt-history-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                          <span>{item.foodName || item.title || item.foodTitle || item.name || 'Donation Item'} (Qty: {item.quantity || item.qty || 'N/A'})</span>
                          <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: '700' }}>Completed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ক্লোজ বাটন */}
            <button className="pt-close-action-btn" onClick={() => setSelectedPartner(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
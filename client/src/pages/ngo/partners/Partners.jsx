import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, UserCheck, Handshake, Users } from 'lucide-react';
import { getCurrentUser } from '../../../services/auth';
import { getSocket } from '../../../services/socket';
import {
  fetchSuggestedPartners,
  fetchFollowing,
  fetchFollowers,
  followPartner,
  unfollowPartner,
  fetchNgoDonations,
} from '../../../services/api';
import './Partners.css';

const initials = (name = '') =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function Partners() {
  const user = getCurrentUser();
  const [tab, setTab] = useState('discover'); // discover | following | followers
  const [suggestions, setSuggestions] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [donationPartners, setDonationPartners] = useState([]);
  const [partnersError, setPartnersError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadAll = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setPartnersError("");

    try {
      const [sugg, follows, backers, donationResult] =
        await Promise.all([
          fetchSuggestedPartners(user.id, user.role),
          fetchFollowing(user.id),
          fetchFollowers(user.id),
          user.role === "ngo"
            ? fetchNgoDonations(user.id)
            : Promise.resolve({ donations: [] }),
        ]);

      setSuggestions(sugg || []);
      setFollowing(follows || []);
      setFollowers(backers || []);

      // NGO যেসব donation request করেছে, সেগুলোর donor/restaurant
      const donations = donationResult?.donations || [];

      const uniquePartners = new Map();

      donations.forEach((donation) => {
        const donor = donation?.donor;

        // Donor অবশ্যই populated User object হতে হবে
        if (!donor || typeof donor !== "object" || !donor._id) {
          return;
        }

        const donorId = String(donor._id);

        if (!uniquePartners.has(donorId)) {
          uniquePartners.set(donorId, {
            userId: donorId,
            name: donor.name || "Restaurant",
            email: donor.email || "",
            role: donor.role || "donor",
            address:
              donation.restaurantAddress ||
              donation.pickupAddress ||
              "",
            donationCount: 1,
            latestDonation: donation.foodName || "",
          });
        } else {
          const partner = uniquePartners.get(donorId);
          partner.donationCount += 1;

          if (!partner.latestDonation && donation.foodName) {
            partner.latestDonation = donation.foodName;
          }
        }
      });

      setDonationPartners(
        Array.from(uniquePartners.values())
      );
    } catch (error) {
      console.error("Error loading partners:", error);
      setPartnersError(
        error?.response?.data?.message ||
        "Could not load donation partners."
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    loadAll();

    // Live "someone followed you" notification, Instagram-style
    const socket = getSocket();
    const onFollow = () => loadAll();
    socket.on('follow:new', onFollow);
    socket.on('follow:removed', onFollow);
    return () => {
      socket.off('follow:new', onFollow);
      socket.off('follow:removed', onFollow);
    };
  }, [loadAll]);

  const isFollowing = (targetUserId) => following.some((f) => f.following?._id === targetUserId);

  const handleFollow = async (targetId, targetRole) => {
    setBusyId(targetId);
    try {
      await followPartner(user.id, user.role, targetId, targetRole);
      await loadAll();
    } catch (error) {
      alert(error?.response?.data?.message || 'Could not follow this partner.');
    } finally {
      setBusyId(null);
    }
  };

  const handleUnfollow = async (targetId, targetRole) => {
    setBusyId(targetId);
    try {
      await unfollowPartner(user.id, user.role, targetId, targetRole);
      await loadAll();
    } catch (error) {
      console.error(error);
    } finally {
      setBusyId(null);
    }
  };

  const oppositeLabel = user?.role === 'ngo' ? 'Restaurants' : 'NGOs';

  const renderCard = (item, { targetId, targetRole, name, meta, mutual }) => (
    <div className="pt-card" key={targetId}>
      <div className="pt-avatar">{initials(name)}</div>
      <p className="pt-name">{name}</p>
      <p className="pt-meta">{meta}</p>
      {mutual && (
        <span className="pt-partner-badge">
          <Handshake className="w-3 h-3" style={{ display: 'inline', marginRight: 4 }} /> Official Partner
        </span>
      )}
      <button
        disabled={busyId === targetId}
        className={`pt-follow-btn ${isFollowing(targetId) ? 'following' : 'not-following'}`}
        onClick={() =>
          isFollowing(targetId) ? handleUnfollow(targetId, targetRole) : handleFollow(targetId, targetRole)
        }
      >
        {isFollowing(targetId) ? (
          <>
            <UserCheck className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: 4 }} /> Following
          </>
        ) : (
          <>
            <UserPlus className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: 4 }} /> Follow
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="pt-container">
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
        suggestions.length === 0 ? (
          <div className="pt-empty">
            <Users className="w-6 h-6" style={{ margin: '0 auto 8px' }} />
            No new {oppositeLabel.toLowerCase()} to suggest right now.
          </div>
        ) : (
          <div className="pt-grid">
            {suggestions.map((s) =>
              renderCard(s, { targetId: s.userId, targetRole: s.role, name: s.name, meta: s.address || s.organizationId || '' })
            )}
          </div>
        )
      ) : tab === 'following' ? (
        following.length === 0 ? (
          <div className="pt-empty">You aren't following anyone yet — check the Discover tab.</div>
        ) : (
          <div className="pt-grid">
            {following.map((f) =>
              renderCard(f, {
                targetId: f.following?._id,
                targetRole: f.followingRole,
                name: f.following?.name,
                meta: f.following?.email,
                mutual: f.isMutualPartner,
              })
            )}
          </div>
        )
      ) : followers.length === 0 ? (
        <div className="pt-empty">No one is following you yet.</div>
      ) : (
        <div className="pt-grid">
          {followers.map((f) => (
            <div className="pt-card" key={f._id}>
              <div className="pt-avatar">{initials(f.follower?.name)}</div>
              <p className="pt-name">{f.follower?.name}</p>
              <p className="pt-meta">{f.follower?.email}</p>
              {f.isMutualPartner && (
                <span className="pt-partner-badge">
                  <Handshake className="w-3 h-3" style={{ display: 'inline', marginRight: 4 }} /> Official Partner
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { Phone, Eye, MapPin, Clock, Truck, CheckCircle2, ChevronRight, PackageCheck, Ban } from 'lucide-react';
import { Map as PigeonMap, Marker } from 'pigeon-maps';
import { getCurrentUser } from '../../../services/auth';
import { getSocket } from '../../../services/socket';
import {
  fetchAvailableDonations,
  fetchNgoDonations,
  fetchNgoProfile,
  acceptDonation,
  updateDonationStatus,
} from '../../../services/api';
import './ActiveRequests.css';

const DEFAULT_CENTER = [22.3569, 91.7832];

// Ordered pipeline updated to match database status strings ("NGO Accepted")
const NEXT_STATUS = {
  'NGO Accepted': 'Out for Delivery',
  'Out for Delivery': 'Completed',
};

export default function ActiveRequests() {
  const user = getCurrentUser();

  const [ngoId, setNgoId] = useState(null);
  const [available, setAvailable] = useState([]);
  const [activePickups, setActivePickups] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);
  const [showAllPickups, setShowAllPickups] = useState(false);
  const [showAllAvailable, setShowAllAvailable] = useState(false);

  const pushAlert = useCallback((text) => {
    setAlerts((prev) => [{ text, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20));
  }, []);

  const loadEverything = useCallback(async () => {
    try {
      setLoading(true);

      let profile = null;
      try {
        profile = await fetchNgoProfile();
      } catch {
        // profile route requires auth
      }
      const currentNgoId = profile?._id || null;
      setNgoId(currentNgoId);

      navigator.geolocation?.getCurrentPosition(
        async (pos) => {
          const list = await fetchAvailableDonations(pos.coords.latitude, pos.coords.longitude);
          setAvailable(list);
        },
        async () => {
          const list = await fetchAvailableDonations();
          setAvailable(list);
        },
        { timeout: 4000 }
      );

      if (currentNgoId) {
        const { active } = await fetchNgoDonations(currentNgoId);
        setActivePickups(active || []);
      }
    } catch (error) {
      console.error('Error loading active requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEverything();

    const socket = getSocket();
    const onNew = (donation) => {
      pushAlert(`🍽️ New donation posted: ${donation.foodName} (${donation.quantity}kg)`);
      loadEverything();
    };
    const onUpdated = (donation) => {
      pushAlert(`🔄 ${donation.foodName} is now "${donation.status}"`);
      loadEverything();
    };

    socket.on('donation:new', onNew);
    socket.on('donation:updated', onUpdated);

    return () => {
      socket.off('donation:new', onNew);
      socket.off('donation:updated', onUpdated);
    };
  }, [loadEverything, pushAlert]);

  const handleAccept = async (donationId) => {
    if (!ngoId) {
      alert('Your NGO profile could not be verified. Please log in again.');
      return;
    }
    setBusyId(donationId);
    try {
      await acceptDonation(donationId, ngoId);
      pushAlert('✅ Donation accepted — moved to your Active Pickups.');
      await loadEverything();
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to accept this donation.');
    } finally {
      setBusyId(null);
    }
  };

  const handleAdvanceStatus = async (donation) => {
    const next = NEXT_STATUS[donation.status];
    if (!next) return;
    setBusyId(donation._id);
    try {
      await updateDonationStatus(donation._id, next, '', user?.id);
      pushAlert(`📦 ${donation.foodName} marked as "${next}".`);
      await loadEverything();
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to update status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (donationId) => {
    setBusyId(donationId);
    try {
      await updateDonationStatus(donationId, 'Rejected', 'Declined by NGO', user?.id);
      pushAlert('⛔ Donation declined.');
      await loadEverything();
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to decline.');
    } finally {
      setBusyId(null);
    }
  };

  const displayedAvailable = showAllAvailable ? available : available.slice(0, 2);
  const displayedPickups = showAllPickups ? activePickups : activePickups.slice(0, 2);
  const displayedAlerts = alerts.slice(0, 6);

  if (loading) {
    return (
      <div className="ar-container flex justify-center items-center h-64">
        <p className="text-slate-500 font-medium">Loading active requests...</p>
      </div>
    );
  }

  return (
    <div className="ar-container">
      {/* Top Banner Header */}
      <div className="ar-top-banner">
        <div>
          <h2 className="ar-banner-title">ACTIVE PICKUPS: Live Restaurant &rarr; NGO Pipeline</h2>
          <p className="text-xs text-slate-500 mt-1">
            {available.length} donation(s) waiting to be claimed &middot; {activePickups.length} in your active pipeline
          </p>
        </div>
      </div>

      <div className="ar-main-grid">
        {/* Left Column */}
        <div className="ar-pickup-list-col">
          {/* ===================== AVAILABLE DONATIONS ===================== */}
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
            Available Donations Near You
          </h3>

          {displayedAvailable.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 mb-4">
              <p className="text-slate-500 text-sm">No pending donations right now. New posts appear here instantly.</p>
            </div>
          ) : (
            displayedAvailable.map((donation) => (
              <div key={donation._id} className="ar-pickup-card">
                <div className="ar-card-grid">
                  <div className="ar-card-info">
                    <div className="ar-id-row">
                      <span className="ar-id-text">DONATION: {donation.donationId}</span>
                      <span className="ar-status-badge">
                        <span className="ar-status-ping"></span>
                        {donation.status || 'Pending'}
                      </span>
                    </div>

                    <p className="text-slate-700">
                      <span className="font-bold text-slate-900">RESTAURANT:</span> {donation.donor?.name || 'Unknown'}{' '}
                      {donation.distanceKm != null ? (
                        <span className="text-amber-500 font-bold"> ({donation.distanceKm} km away)</span>
                      ) : (
                        <span className="text-slate-400 font-medium text-[11px]"> (distance unavailable)</span>
                      )}
                    </p>

                    <div className="ar-food-box">
                      <p className="font-bold text-slate-800 text-[11px]">FOOD:</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        {donation.foodName} &middot; {donation.quantity}kg &middot; ~{donation.estimatedMeals} meals
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="font-bold text-slate-900">PICKUP ADDRESS:</span>
                      <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 truncate max-w-[160px]">
                        {donation.pickupAddress}
                      </span>
                    </div>

                    <div className="ar-action-btns">
                      <button className="ar-btn-view" onClick={() => setViewDetails(donation)}>
                        <Eye className="w-3.5 h-3.5" /> VIEW DETAILS
                      </button>
                      <button
                        disabled={busyId === donation._id}
                        onClick={() => handleAccept(donation._id)}
                        className="ar-btn-contact"
                        style={{ background: '#059669' }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> {busyId === donation._id ? 'ACCEPTING...' : 'ACCEPT'}
                      </button>
                      <button
                        disabled={busyId === donation._id}
                        onClick={() => handleReject(donation._id)}
                        className="ar-btn-archive"
                      >
                        DECLINE
                      </button>
                    </div>
                  </div>

                  <div className="ar-card-map-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Location</span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {donation.resolvedLocation?.source || 'unresolved'}
                      </span>
                    </div>
                    <div className="ar-map-wrapper">
                      <PigeonMap
                        defaultCenter={
                          donation.resolvedLocation
                            ? [donation.resolvedLocation.lat, donation.resolvedLocation.lng]
                            : DEFAULT_CENTER
                        }
                        defaultZoom={13}
                      >
                        {donation.resolvedLocation && (
                          <Marker
                            width={30}
                            anchor={[donation.resolvedLocation.lat, donation.resolvedLocation.lng]}
                            color="#059669"
                          />
                        )}
                      </PigeonMap>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {available.length > 2 && (
            <button onClick={() => setShowAllAvailable(!showAllAvailable)} className="ar-see-more-btn">
              <span>{showAllAvailable ? 'SHOW LESS' : `SEE MORE (${available.length - 2} MORE)`}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showAllAvailable ? '-rotate-90' : 'rotate-90'}`} />
            </button>
          )}

          {/* ===================== MY ACTIVE PICKUPS ===================== */}
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mt-6 mb-2">
            My Active Pickups
          </h3>

          {displayedPickups.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
              <p className="text-slate-500 text-sm">You haven't accepted any donations yet.</p>
            </div>
          ) : (
            displayedPickups.map((pickup) => (
              <div key={pickup._id} className="ar-pickup-card">
                <div className="ar-card-info" style={{ width: '100%' }}>
                  <div className="ar-id-row">
                    <span className="ar-id-text">PICKUP: {pickup.donationId}</span>
                    <span className="ar-status-badge">
                      <span className="ar-status-ping"></span>
                      {pickup.status}
                    </span>
                  </div>

                  <p className="text-slate-700">
                    <span className="font-bold text-slate-900">RESTAURANT:</span> {pickup.donor?.name}
                  </p>

                  <div className="ar-food-box">
                    <p className="font-bold text-slate-800 text-[11px]">FOOD:</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      {pickup.foodName} &middot; {pickup.quantity}kg
                    </p>
                  </div>

                  <div className="ar-action-btns">
                    <button className="ar-btn-view" onClick={() => setViewDetails(pickup)}>
                      <Eye className="w-3.5 h-3.5" /> VIEW DETAILS
                    </button>
                    <a href={`tel:${pickup.contactNumber}`} className="ar-btn-contact">
                      <Phone className="w-3.5 h-3.5" /> CALL RESTAURANT
                    </a>
                    {NEXT_STATUS[pickup.status] && (
                      <button
                        disabled={busyId === pickup._id}
                        onClick={() => handleAdvanceStatus(pickup)}
                        className="ar-btn-archive"
                        style={{ background: '#0f172a', color: '#fff' }}
                      >
                        <Truck className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: 4 }} />
                        {busyId === pickup._id ? 'UPDATING...' : `MARK "${NEXT_STATUS[pickup.status].toUpperCase()}"`}
                      </button>
                    )}
                    {pickup.status === 'Completed' && (
                      <span className="ar-btn-archive" style={{ background: '#dcfce7', color: '#166534' }}>
                        <PackageCheck className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: 4 }} /> ARCHIVED IN HISTORY
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {activePickups.length > 2 && (
            <button onClick={() => setShowAllPickups(!showAllPickups)} className="ar-see-more-btn">
              <span>{showAllPickups ? 'SHOW LESS PICKUPS' : `SEE MORE PICKUPS (${activePickups.length - 2} MORE)`}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showAllPickups ? '-rotate-90' : 'rotate-90'}`} />
            </button>
          )}
        </div>

        {/* Right Column: Live Alerts Feed */}
        <div className="ar-alerts-col">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-3">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">LIVE ACTIVITY FEED</h3>
              <p className="text-[10px] text-slate-400">Real-time via Socket.IO</p>
            </div>
          </div>

          <div className="space-y-3">
            {displayedAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent activity yet.</p>
            ) : (
              displayedAlerts.map((al, idx) => (
                <div key={idx} className="ar-alert-card">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {al.time}
                    </span>
                    <span className="uppercase text-[9px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">Live</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">{al.text}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700 text-center">
            <p className="text-[10px] text-slate-400">Auto-updating live via FeedLink Real-Time Sync</p>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {viewDetails && (
        <div className="ar-modal-backdrop">
          <div className="ar-modal-content">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Donation Details</h3>
                <p className="text-xs text-slate-500">ID: {viewDetails.donationId}</p>
              </div>
              <button onClick={() => setViewDetails(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200/80 text-xs">
              <p className="text-slate-700"><span className="font-bold">Restaurant:</span> {viewDetails.donor?.name}</p>
              <p className="text-slate-700"><span className="font-bold">Food:</span> {viewDetails.foodName} ({viewDetails.foodCategory}, {viewDetails.condition})</p>
              <p className="text-slate-700"><span className="font-bold">Quantity:</span> {viewDetails.quantity} kg &middot; ~{viewDetails.estimatedMeals} meals</p>
              <p className="text-slate-700"><span className="font-bold">Best Before:</span> {new Date(viewDetails.bestBefore).toLocaleString()}</p>
              <p className="text-slate-700"><span className="font-bold">Pickup Address:</span> {viewDetails.pickupAddress}</p>
              <p className="text-slate-700"><span className="font-bold">Pickup Window:</span> {viewDetails.pickupDate ? new Date(viewDetails.pickupDate).toLocaleDateString() : ''} at {viewDetails.pickupTime} ({viewDetails.pickupDuration})</p>
              <p className="text-slate-700"><span className="font-bold">Contact:</span> {viewDetails.contactNumber}</p>
              {viewDetails.specialInstructions && (
                <p className="text-slate-700"><span className="font-bold">Notes:</span> {viewDetails.specialInstructions}</p>
              )}
            </div>

            <button
              onClick={() => setViewDetails(null)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer border-none w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

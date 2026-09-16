import React, { useState, useEffect, useCallback } from 'react';
import { Map as PigeonMap, Marker, Overlay } from 'pigeon-maps';
import { Check, X, MapPin, Truck, ChevronRight, Eye, LocateFixed } from 'lucide-react';
import { getSocket } from '../../../services/socket';
import { fetchAvailableDonations, fetchNgoProfile, acceptDonation, updateDonationStatus } from '../../../services/api';
import './DonationMap.css';

const DEFAULT_CENTER = [22.3567, 91.8197];

export default function DonationMap() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(13);
  const [selectedId, setSelectedId] = useState(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [ngoId, setNgoId] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadDonations = useCallback(async (lat, lng) => {
    setLoading(true);
    try {
      const list = await fetchAvailableDonations(lat, lng);
      setDonations(list);
    } catch (error) {
      console.error('Error fetching donations for the map:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const locateMe = useCallback(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setMyLocation(loc);
        setCenter(loc);
        loadDonations(pos.coords.latitude, pos.coords.longitude);
      },
      () => loadDonations(),
      { timeout: 5000 }
    );
  }, [loadDonations]);

  useEffect(() => {
    fetchNgoProfile()
      .then((profile) => setNgoId(profile?._id || null))
      .catch(() => setNgoId(null));

    locateMe();

    const socket = getSocket();
    const refresh = () => (myLocation ? loadDonations(myLocation[0], myLocation[1]) : loadDonations());
    socket.on('donation:new', refresh);
    socket.on('donation:updated', refresh);
    return () => {
      socket.off('donation:new', refresh);
      socket.off('donation:updated', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const coordsOf = (d) => (d.resolvedLocation ? [d.resolvedLocation.lat, d.resolvedLocation.lng] : null);

  const handleSelect = (e, d) => {
    e?.preventDefault();
    e?.stopPropagation();
    setSelectedId(d._id);
    const c = coordsOf(d);
    if (c) {
      setCenter(c);
      setZoom(15);
    }
  };

  const handleAccept = async (e, donation) => {
    e?.stopPropagation();
    if (!ngoId) {
      alert('Your NGO profile could not be verified. Please log in again.');
      return;
    }
    setBusyId(donation._id);
    try {
      await acceptDonation(donation._id, ngoId);
      setDonations((prev) => prev.filter((d) => d._id !== donation._id));
      if (selectedId === donation._id) setSelectedId(null);
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to accept.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDecline = async (e, donation) => {
    e?.stopPropagation();
    setBusyId(donation._id);
    try {
      await updateDonationStatus(donation._id, 'Rejected', 'Declined from map view');
      setDonations((prev) => prev.filter((d) => d._id !== donation._id));
      if (selectedId === donation._id) setSelectedId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setBusyId(null);
    }
  };

  const selectedDonation = donations.find((d) => d._id === selectedId);

  return (
    <div className="dm-container">
      <div className="dm-map-column">
        <div className="dm-map-header">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 m-0">
            <MapPin className="w-5 h-5 text-emerald-600" /> DONATION LOCATIONS MAP
          </h3>
          <div className="flex gap-2">
            <button type="button" onClick={locateMe} className="dm-reset-btn">
              <LocateFixed className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: 4 }} />
              Use My Location
            </button>
            {selectedId && (
              <button
                type="button"
                onClick={() => { setSelectedId(null); setZoom(13); setCenter(myLocation || DEFAULT_CENTER); }}
                className="dm-reset-btn"
              >
                Reset View
              </button>
            )}
          </div>
        </div>

        <div className="dm-pigeon-wrapper">
          <PigeonMap
            center={center}
            zoom={zoom}
            onBoundsChanged={({ center, zoom }) => {
              setCenter(center);
              setZoom(zoom);
            }}
          >
            {myLocation && <Marker width={26} anchor={myLocation} color="#2563eb" />}

            {donations.map((d) => {
              const c = coordsOf(d);
              if (!c) return null;
              const isSelected = selectedId === d._id;
              return (
                <Marker
                  key={d._id}
                  width={isSelected ? 36 : 28}
                  anchor={c}
                  color={isSelected ? '#E11D48' : '#059669'}
                  onClick={(e) => handleSelect(e, d)}
                />
              );
            })}

            {selectedDonation && coordsOf(selectedDonation) && (
              <Overlay anchor={coordsOf(selectedDonation)} offset={[0, -35]}>
                <div className="dm-overlay-box">
                  <p className="font-bold text-emerald-400 m-0">{selectedDonation.donor?.name}</p>
                  <p className="text-[10px] text-slate-300 m-0">{selectedDonation.pickupAddress}</p>
                  <p className="text-[10px] text-slate-400 border-t border-slate-700 pt-1 mt-1 m-0">
                    {selectedDonation.foodName} &middot; {selectedDonation.quantity}kg
                  </p>
                </div>
              </Overlay>
            )}
          </PigeonMap>

          <div className="dm-map-badge">
            <span className="dm-pulse-dot"></span>
            Showing {donations.filter((d) => coordsOf(d)).length} Pending Pins
            {donations.some((d) => !coordsOf(d)) && ` (+${donations.filter((d) => !coordsOf(d)).length} without resolvable location)`}
          </div>
        </div>
      </div>

      <div className="dm-widget-column">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base uppercase tracking-tight m-0">
              ACTIVE REQUESTS
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 m-0">
              Showing latest {Math.min(donations.length, 2)} pending actions
            </p>
          </div>
          <span className="bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full text-xs">
            {donations.length} Total
          </span>
        </div>

        <div className="space-y-3.5">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400 font-medium">Loading donations...</div>
          ) : (
            donations.slice(0, 2).map((d) => {
              const isSelected = selectedId === d._id;
              return (
                <div key={d._id} onClick={(e) => handleSelect(e, d)} className={`dm-request-card ${isSelected ? 'selected' : 'unselected'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900 text-sm m-0">{d.donor?.name}</h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {d.distanceKm != null ? `${d.distanceKm} km` : 'distance n/a'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-2.5">
                    <Truck className="w-3.5 h-3.5 text-rose-500 inline" /> {d.pickupDuration || 'Standard pickup'}
                  </p>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 mb-3">
                    <p className="text-xs text-slate-600 font-medium line-clamp-1 m-0">
                      {d.foodName} &middot; {d.quantity}kg
                    </p>
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button type="button" disabled={busyId === d._id} onClick={(e) => handleAccept(e, d)} className="dm-accept-btn">
                      <Check className="w-4 h-4 stroke-[3]" /> {busyId === d._id ? '...' : 'ACCEPT'}
                    </button>
                    <button type="button" disabled={busyId === d._id} onClick={(e) => handleDecline(e, d)} className="dm-decline-btn">
                      <X className="w-4 h-4 stroke-[3]" /> DECLINE
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {!loading && donations.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400 font-medium">
              No pending requests at the moment.
            </div>
          )}
        </div>

        <button type="button" onClick={(e) => { e.preventDefault(); setShowAllModal(true); }} className="dm-see-all-btn">
          <span>SEE ALL ACTIVE REQUESTS ({donations.length})</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {showAllModal && (
        <div className="dm-modal-backdrop">
          <div className="dm-modal-box">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base m-0">All Active Requests ({donations.length})</h3>
              <button type="button" onClick={() => setShowAllModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none cursor-pointer">✕</button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {donations.map((d) => (
                <div key={d._id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm m-0">{d.donor?.name}</h4>
                    <p className="text-xs text-slate-500 m-0">{d.foodName} &middot; {d.quantity}kg</p>
                    <p className="text-[10px] text-emerald-600 font-bold m-0">{d.pickupAddress}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={(e) => { handleSelect(e, d); setShowAllModal(false); }} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border-none cursor-pointer">
                      <Eye className="w-3.5 h-3.5" /> Map
                    </button>
                    <button type="button" onClick={(e) => handleAccept(e, d)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer">
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

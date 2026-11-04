import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Map as PigeonMap, Marker, Overlay } from 'pigeon-maps';
import { Check, X, MapPin, Truck, ChevronRight, Eye, LocateFixed, Search } from 'lucide-react';
import { getSocket } from '../../../services/socket';
import { fetchAvailableDonations, fetchNgoProfile, acceptDonation, updateDonationStatus } from '../../../services/api';
import './DonationMap.css';

const DEFAULT_CENTER = [22.3567, 91.8197]; // সদরঘাট/চট্টগ্রাম ডিফল্ট কোঅর্ডিনেট

export default function DonationMap() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(13);
  const [selectedId, setSelectedId] = useState(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [ngoId, setNgoId] = useState(null);
  const [myLocation, setMyLocation] = useState(DEFAULT_CENTER); // NGO Location
  const [busyId, setBusyId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const myLocationRef = useRef(DEFAULT_CENTER);

  const loadDonations = useCallback(async (lat, lng) => {
    try {
      const currentLat = lat || DEFAULT_CENTER[0];
      const currentLng = lng || DEFAULT_CENTER[1];
      
      const list = await fetchAvailableDonations(currentLat, currentLng);
      setDonations(Array.isArray(list) ? list : (list.donations || []));
    } catch (error) {
      console.error('Error fetching donations for the map:', error);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const locateMe = useCallback(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        myLocationRef.current = loc;
        setMyLocation(loc);
        setCenter(loc);
        loadDonations(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        myLocationRef.current = DEFAULT_CENTER;
        setMyLocation(DEFAULT_CENTER);
        loadDonations(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
      },
      { timeout: 5000 }
    );
  }, [loadDonations]);

  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Chittagong')}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setCenter([lat, lon]);
        setZoom(16);
      } else {
        alert('Location not found in Chittagong. Try a more specific landmark.');
      }
    } catch (err) {
      console.error('Search location error:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    fetchNgoProfile()
      .then((profile) => {
        if (isMounted) setNgoId(profile?._id || null);
      })
      .catch(() => {
        if (isMounted) setNgoId(null);
      });

    locateMe();

    const socket = getSocket();
    const refresh = () => {
      const loc = myLocationRef.current || DEFAULT_CENTER;
      loadDonations(loc[0], loc[1]);
    };

    socket.on('donation:new', refresh);
    socket.on('donation:updated', refresh);

    return () => {
      isMounted = false;
      socket.off('donation:new', refresh);
      socket.off('donation:updated', refresh);
    };
  }, [loadDonations, locateMe]);

  const coordsOf = (d) => {
    const lat = d.resolvedLocation?.lat || d.latitude;
    const lng = d.resolvedLocation?.lng || d.longitude;
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      return [Number(lat), Number(lng)];
    }
    return null;
  };

  const handleSelect = (e, d) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
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
  const selectedCoords = selectedDonation ? coordsOf(selectedDonation) : null;

  return (
    <div className="dm-container">
      <div className="dm-map-column">
        <div className="dm-map-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 m-0">
            <MapPin className="w-5 h-5 text-emerald-600" /> DONATION LOCATIONS MAP
          </h3>

          <form onSubmit={handleLocationSearch} className="flex gap-1 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search area (e.g. Sadarghat)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1 text-xs border border-slate-300 rounded-lg outline-none focus:border-emerald-500 bg-white text-slate-800"
            />
            <button type="submit" className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer border-none flex items-center">
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex gap-2">
            <button type="button" onClick={locateMe} className="dm-reset-btn">
              <LocateFixed className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: 4 }} />
              My Location
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

        <div className="dm-pigeon-wrapper" style={{ position: 'relative' }}>
          <PigeonMap
            center={center}
            zoom={zoom}
            onBoundsChanged={({ center, zoom }) => {
              setCenter(center);
              setZoom(zoom);
            }}
          >
            {/* NGO (সদরঘাট/আপনার লোকেশন) নীল মার্কার */}
            {myLocation && (
              <Marker width={32} anchor={myLocation} color="#0284c7" onClick={() => alert("NGO Location (Sadarghat)")} />
            )}

            {/* ডোনেশন মার্কারসমূহ */}
            {donations.map((d) => {
              const c = coordsOf(d);
              if (!c) return null;
              const isSelected = selectedId === d._id;
              return (
                <Marker
                  key={d._id}
                  width={isSelected ? 38 : 28}
                  anchor={c}
                  color={isSelected ? '#e11d48' : '#059669'}
                  onClick={(e) => handleSelect(e, d)}
                />
              );
            })}

            {/* ম্যাপের ওপর আকাশী রঙের রুট লাইন */}
            {selectedCoords && myLocation && (
              <Overlay anchor={myLocation} offset={[0, 0]}>
                <svg
                  style={{
                    position: 'absolute',
                    top: -500,
                    left: -500,
                    width: 1000,
                    height: 1000,
                    pointerEvents: 'none',
                    overflow: 'visible'
                  }}
                >
                  <line
                    x1="500"
                    y1="500"
                    x2={500 + (selectedCoords[1] - myLocation[1]) * 10000}
                    y2={500 - (selectedCoords[0] - myLocation[0]) * 10000}
                    stroke="#0284c7"
                    strokeWidth="5"
                    strokeDasharray="6, 6"
                    strokeLinecap="round"
                  />
                </svg>
              </Overlay>
            )}

            {/* সিলেক্টেড রেস্টুরেন্টের ডিটেইলস পপআপ */}
            {selectedDonation && selectedCoords && (
              <Overlay anchor={selectedCoords} offset={[0, -38]}>
                <div className="dm-overlay-box" style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '10px', border: '1px solid #38bdf8', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <p className="font-bold text-sky-400 m-0" style={{ fontSize: '13px' }}>
                      {selectedDonation.donor?.restaurantName || selectedDonation.donor?.businessName || selectedDonation.donor?.name || "Partner Restaurant"}
                    </p>
                    {selectedDonation.distanceKm && (
                      <span style={{ background: '#0284c7', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                        {selectedDonation.distanceKm} km
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 m-0" style={{ marginTop: '4px' }}>📍 {selectedDonation.pickupAddress}</p>
                  <p className="text-[11px] text-emerald-400 border-t border-slate-700 pt-1 mt-1.5 m-0 font-medium">
                    🍲 {selectedDonation.foodName} · {selectedDonation.quantity}kg
                  </p>
                </div>
              </Overlay>
            )}
          </PigeonMap>

          <div className="dm-map-badge">
            <span className="dm-pulse-dot"></span>
            Showing {donations.filter((d) => coordsOf(d)).length} Mapped Pins
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
              const restaurantTitle = d.donor?.restaurantName || d.donor?.businessName || d.donor?.name || "Partner Restaurant";
              return (
                <div key={d._id} onClick={(e) => handleSelect(e, d)} className={`dm-request-card ${isSelected ? 'selected' : 'unselected'}`} style={{ cursor: 'pointer' }}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900 text-sm m-0">{restaurantTitle}</h4>
                    <span className="text-[11px] text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {d.distanceKm != null ? `${d.distanceKm} km away` : 'distance n/a'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-2.5">
                    <Truck className="w-3.5 h-3.5 text-rose-500 inline" /> {d.pickupDuration || 'Standard pickup'}
                  </p>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 mb-3">
                    <p className="text-xs text-slate-600 font-medium line-clamp-1 m-0">
                      {d.foodName} · {d.quantity}kg · <span className="text-emerald-700 font-bold">{d.pickupAddress}</span>
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
              {donations.map((d) => {
                const restTitle = d.donor?.restaurantName || d.donor?.businessName || d.donor?.name || "Partner Restaurant";
                return (
                  <div key={d._id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm m-0">{restTitle}</h4>
                      <p className="text-xs text-slate-500 m-0">{d.foodName} · {d.quantity}kg</p>
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
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
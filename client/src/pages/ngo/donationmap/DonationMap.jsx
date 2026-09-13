import React, { useState, useEffect } from 'react';
import { Map as PigeonMap, Marker, Overlay } from 'pigeon-maps';
import { Check, X, MapPin, Truck, ChevronRight, Eye } from 'lucide-react';
import axios from 'axios';
import './DonationMap.css';

export default function DonationMap({ initialRequests }) {
  const [requests, setRequests] = useState(initialRequests || []);
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState([22.3567, 91.8197]);
  const [zoom, setZoom] = useState(13);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [showAllModal, setShowAllModal] = useState(false);

  useEffect(() => {
    if (!initialRequests) {
      const fetchDonations = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          // এখানে ভুল /api/ngo/requests এর পরিবর্তে সঠিক /api/requests রাউট ব্যবহার করা হয়েছে
          const response = await axios.get('http://localhost:5000/api/requests', {
            headers: { Authorization: `Bearer ${token}` }
          }); 
          if (response.data && response.data.success && Array.isArray(response.data.data)) {
            setRequests(response.data.data);
          } else if (Array.isArray(response.data)) {
            setRequests(response.data);
          }
        } catch (error) {
          console.error("Error fetching donation requests:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDonations();
    }
  }, [initialRequests]);

  const handleSelectRequest = (e, req) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const reqId = req.id || req._id;
    setSelectedRequestId(reqId);
    if (req.coords && req.coords.length === 2) {
      setCenter(req.coords);
      setZoom(15);
    }
  };

  const handleAction = async (e, id) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/requests/${id}`, {
        status: 'archived'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(prev => prev.filter(r => (r.id || r._id) !== id));
      if (selectedRequestId === id) setSelectedRequestId(null);
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  const selectedReqData = requests.find(r => (r.id || r._id) === selectedRequestId);

  return (
    <div className="dm-container">
      <div className="dm-map-column">
        <div className="dm-map-header">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 m-0">
            <MapPin className="w-5 h-5 text-emerald-600" /> DONATION LOCATIONS MAP
          </h3>
          {selectedRequestId && (
            <button 
              type="button"
              onClick={() => { setSelectedRequestId(null); setZoom(13); setCenter([22.3567, 91.8197]); }}
              className="dm-reset-btn"
            >
              Reset View
            </button>
          )}
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
            {requests.map((req) => {
              const reqId = req.id || req._id;
              const isSelected = selectedRequestId === reqId;
              if (!req.coords || req.coords.length !== 2) return null;
              return (
                <Marker
                  key={reqId}
                  width={isSelected ? 36 : 28}
                  anchor={req.coords}
                  color={isSelected ? "#E11D48" : "#059669"}
                  onClick={(e) => handleSelectRequest(e, req)}
                />
              );
            })}

            {selectedReqData && selectedReqData.coords && (
              <Overlay anchor={selectedReqData.coords} offset={[0, -35]}>
                <div className="dm-overlay-box">
                  <p className="font-bold text-emerald-400 m-0">{selectedReqData.donor}</p>
                  <p className="text-[10px] text-slate-300 m-0">{selectedReqData.address}</p>
                  <p className="text-[10px] text-slate-400 border-t border-slate-700 pt-1 mt-1 m-0">
                    {selectedReqData.foodType}
                  </p>
                </div>
              </Overlay>
            )}
          </PigeonMap>

          <div className="dm-map-badge">
            <span className="dm-pulse-dot"></span>
            Showing {requests.length} Pending Pins
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
              Showing latest {Math.min(requests.length, 2)} pending actions
            </p>
          </div>
          <span className="bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full text-xs">
            {requests.length} Total
          </span>
        </div>

        <div className="space-y-3.5">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400 font-medium">Loading requests...</div>
          ) : (
            requests.slice(0, 2).map((req) => {
              const reqId = req.id || req._id;
              const isSelected = selectedRequestId === reqId;
              return (
                <div 
                  key={reqId}
                  onClick={(e) => handleSelectRequest(e, req)}
                  className={`dm-request-card ${isSelected ? 'selected' : 'unselected'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900 text-sm m-0">{req.donor}</h4>
                    <span className="text-[11px] text-slate-400 font-medium">{req.timeAgo || 'Recent'}</span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-2.5">
                    <Truck className="w-3.5 h-3.5 text-rose-500 inline" /> {req.logistics || 'Standard Delivery'}
                  </p>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 mb-3">
                    <p className="text-xs text-slate-600 font-medium line-clamp-1 m-0">
                      {req.foodType}
                    </p>
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button"
                      onClick={(e) => handleAction(e, reqId)}
                      className="dm-accept-btn"
                    >
                      <Check className="w-4 h-4 stroke-[3]" /> ACCEPT
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => handleAction(e, reqId)}
                      className="dm-decline-btn"
                    >
                      <X className="w-4 h-4 stroke-[3]" /> DECLINE
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {!loading && requests.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400 font-medium">
              No pending requests at the moment.
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setShowAllModal(true);
          }}
          className="dm-see-all-btn"
        >
          <span>SEE ALL ACTIVE REQUESTS ({requests.length})</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {showAllModal && (
        <div className="dm-modal-backdrop">
          <div className="dm-modal-box">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base m-0">
                All Active Requests ({requests.length})
              </h3>
              <button 
                type="button"
                onClick={() => setShowAllModal(false)} 
                className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {requests.map((req) => {
                const reqId = req.id || req._id;
                return (
                  <div 
                    key={reqId} 
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm m-0">{req.donor}</h4>
                      <p className="text-xs text-slate-500 m-0">{req.foodType}</p>
                      <p className="text-[10px] text-emerald-600 font-bold m-0">{req.address}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={(e) => {
                          handleSelectRequest(e, req);
                          setShowAllModal(false);
                        }}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border-none cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Map
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleAction(e, reqId)} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer"
                      >
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
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Phone, Archive, Eye, MapPin, Clock, Truck, ShieldCheck, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Map as PigeonMap, Marker } from 'pigeon-maps';
import './ActiveRequests.css';

export default function ActiveRequests() {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedDriver, setSelectedDriver] = useState(null);

  // ডাইনামিক ডেটার জন্য স্টেট
  const [activePickups, setActivePickups] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // See More toggles for both sides
  const [showAllPickups, setShowAllPickups] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  // ব্যাকএন্ড থেকে ডেটা ফেচ করার জন্য useEffect
  useEffect(() => {
    fetchActiveRequests();
  }, []);

  const fetchActiveRequests = async () => {
    try {
      const token = localStorage.getItem("token"); // লগইন করা টোকেন
      const response = await axios.get("http://localhost:5000/api/requests", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // ব্যাকএন্ড থেকে আসা ডেটাকে ফ্রন্টএন্ডের ফরম্যাটে ম্যাপ করে নেওয়া
        const formattedData = response.data.data.map(item => ({
          id: item.requestId || item._id.slice(-6).toUpperCase(),
          dbId: item._id,
          donor: item.donor || "Unknown Donor",
          trustScore: "4.8",
          location: item.address || "Chattogram",
          logistics: item.logistics || "By Self Option",
          status: item.status || "In Transit",
          driverName: "Assigned Driver",
          driverPhone: "+880 1800-000000",
          foodType: item.foodType || "Food Item",
          eta: item.estimatedArrival || "15 mins",
          coords: item.coords && item.coords.length === 2 ? item.coords : [22.3569, 91.7832]
        }));
        
        setActivePickups(formattedData);
      }
    } catch (error) {
      console.error("Error fetching active pickups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`http://localhost:5000/api/requests/${requestId}`, {
        status: 'accepted' 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert("Request Accepted Successfully!");
        fetchActiveRequests(); // পেজের ডেটা পুনরায় রিফ্রেশ করা
      }
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  // আর্কাইভ হ্যান্ডলার ফাংশন
  const handleArchive = async (dbId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/requests/${dbId}`, {
        status: "Archived"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // সফলভাবে আর্কাইভ হলে লিস্ট রিফ্রেশ হবে
      fetchActiveRequests();
    } catch (error) {
      console.error("Error archiving request:", error);
    }
  };

  // Filtered Pickups Array
  const filteredPickups = activePickups.filter(
    item => filterStatus === 'ALL' || item.status === filterStatus
  );

  // Slice arrays to show only top 2 by default
  const displayedPickups = showAllPickups ? filteredPickups : filteredPickups.slice(0, 2);
  const displayedAlerts = showAllAlerts ? alerts : alerts.slice(0, 2);

  if (loading) {
    return <div className="ar-container flex justify-center items-center h-64"><p className="text-slate-500 font-medium">Loading active requests...</p></div>;
  }

  return (
    <div className="ar-container">
      
      {/* Top Banner Header */}
      <div className="ar-top-banner">
        <div>
          <h2 className="ar-banner-title">ACTIVE PICKUPS: Comprehensive Monitoring (In Progress)</h2>
         
          <div className="ar-filter-btns">
            {['ALL', 'In Transit', 'Picked Up', 'pending'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`ar-filter-btn ${
                  filterStatus === st 
                    ? 'ar-filter-btn-active' 
                    : 'ar-filter-btn-inactive'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Active Cards List + Logistics Timeline */}
      <div className="ar-main-grid">
        
        {/* Left Column: Active Pickup Cards (8 Cols) */}
        <div className="ar-pickup-list-col">
          {displayedPickups.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
              <p className="text-slate-500 text-sm">No active donation requests found.</p>
            </div>
          ) : (
            displayedPickups.map((pickup) => (
              <div key={pickup.dbId} className="ar-pickup-card">
                <div className="ar-card-grid">
                  
                  {/* Info Details */}
                  <div className="ar-card-info">
                    <div className="ar-id-row">
                      <span className="ar-id-text">PICKUP ID: {pickup.id}</span>
                      <span className="ar-status-badge">
                        <span className="ar-status-ping"></span>
                        {pickup.status}
                      </span>
                    </div>

                    <p className="text-slate-700">
                      <span className="font-bold text-slate-900">DONOR:</span> {pickup.donor}{' '}
                      <span className="text-amber-500 font-bold"> (★ {pickup.trustScore} Trust Score, {pickup.location})</span>
                    </p>

                    <p className="text-slate-700 flex items-center gap-1">
                      <span className="font-bold text-slate-900">LOGISTICS:</span> {pickup.logistics}{' '}
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                    </p>

                    <div className="ar-food-box">
                      <p className="font-bold text-slate-800 text-[11px]">FOOD TYPE:</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">{pickup.foodType}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="font-bold text-slate-900">ESTIMATED ARRIVAL:</span>
                      <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{pickup.eta}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="ar-action-btns">
                      <button className="ar-btn-view">
                        <Eye className="w-3.5 h-3.5" /> VIEW DETAILS
                      </button>
                      <button 
                        onClick={() => setSelectedDriver(pickup)} 
                        className="ar-btn-contact"
                      >
                        <Phone className="w-3.5 h-3.5" /> CONTACT DRIVER
                      </button>
                      <button 
                        onClick={() => handleArchive(pickup.dbId)}
                        className="ar-btn-archive"
                      >
                        ARCHIVE
                      </button>
                    </div>
                  </div>

                  {/* Live Mini Map Snippet */}
                  <div className="ar-card-map-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Map Snippet</span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Live Tracking
                      </span>
                    </div>
                    <div className="ar-map-wrapper">
                      <PigeonMap defaultCenter={pickup.coords} defaultZoom={13}>
                        <Marker width={30} anchor={pickup.coords} color="#059669" />
                      </PigeonMap>
                    </div>
                  </div>

                </div>
              </div>
            ))
          )}

          {/* SEE MORE BUTTON FOR ACTIVE PICKUPS */}
          {filteredPickups.length > 2 && (
            <button
              onClick={() => setShowAllPickups(!showAllPickups)}
              className="ar-see-more-btn"
            >
              <span>{showAllPickups ? "SHOW LESS PICKUPS" : `SEE MORE PICKUPS (${filteredPickups.length - 2} MORE)`}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showAllPickups ? '-rotate-90' : 'rotate-90'}`} />
            </button>
          )}
        </div>

        {/* Right Column: Logistics Alerts & Live Updates Feed (4 Cols) */}
        <div className="ar-alerts-col">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">LOGISTICS ALERTS</h3>
              <p className="text-[10px] text-slate-400">& UPDATES</p>
            </div>
          </div>

          <div className="space-y-3">
            {displayedAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent alerts available.</p>
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

          {/* SEE MORE BUTTON FOR LOGISTICS ALERTS */}
          {alerts.length > 2 && (
            <button
              onClick={() => setShowAllAlerts(!showAllAlerts)}
              className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
            >
              <span>{showAllAlerts ? "SEE LESS ALERTS" : `SEE MORE ALERTS (${alerts.length - 2} MORE)`}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showAllAlerts ? '-rotate-90' : 'rotate-90'}`} />
            </button>
          )}

          <div className="mt-6 pt-4 border-t border-slate-700 text-center">
            <p className="text-[10px] text-slate-400">Auto-refreshing live logs via FeedLink Dispatch System</p>
          </div>
        </div>

      </div>

      {/* Driver Contact Modal */}
      {selectedDriver && (
        <div className="ar-modal-backdrop">
          <div className="ar-modal-content">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Contact Logistics Driver</h3>
                <p className="text-xs text-slate-500">Pickup ID: {selectedDriver.id}</p>
              </div>
              <button onClick={() => setSelectedDriver(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200/80 text-xs">
              <p className="text-slate-700"><span className="font-bold">Driver Name:</span> {selectedDriver.driverName}</p>
              <p className="text-slate-700"><span className="font-bold">Contact Number:</span> {selectedDriver.driverPhone}</p>
              <p className="text-slate-700"><span className="font-bold">Assigned Transport:</span> {selectedDriver.logistics}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <a 
                href={`tel:${selectedDriver.driverPhone}`} 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm text-center text-decoration-none"
              >
                <Phone className="w-4 h-4" /> Direct Phone Call
              </a>
              <button 
                onClick={() => setSelectedDriver(null)} 
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer border-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
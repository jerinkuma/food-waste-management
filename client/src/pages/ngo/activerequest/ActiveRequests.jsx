import React, { useState } from 'react';
import { Phone, Archive, Eye, MapPin, Clock, Truck, ShieldCheck, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Map as PigeonMap, Marker } from 'pigeon-maps';
import './ActiveRequests.css'; // আলাদা সিএসএস ফাইল ইমপোর্ট করা হলো

export default function ActiveRequests({ requests }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedDriver, setSelectedDriver] = useState(null);

  // See More toggles for both sides
  const [showAllPickups, setShowAllPickups] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  // Expanded Active Pickups Data matching the UI mockup
  const activePickups = [
    {
      id: "AP1001",
      donor: "Café 1",
      trustScore: "4.5",
      location: "Chattogram (Agrabad)",
      logistics: "FoodPanda Tracking",
      status: "In Transit",
      driverName: "Rahim Uddin",
      driverPhone: "+880 1812-345678",
      foodType: "Rice, Chicken Curry (Prepared Meal, ~20 meals)",
      eta: "~15 mins",
      coords: [22.3303, 91.8122]
    },
    {
      id: "AP1002",
      donor: "Hotel Agrabad",
      trustScore: "4.8",
      location: "Chattogram (GEC)",
      logistics: "By Self Option",
      status: "Picked Up",
      driverName: "Self Volunteers (Team B)",
      driverPhone: "+880 1711-987654",
      foodType: "Mixed Buffet Dishes, Bread, Soup (~35 meals)",
      eta: "~8 mins",
      coords: [22.3587, 91.8215]
    },
    {
      id: "AP1003",
      donor: "Restaurant Name 2",
      trustScore: "4.2",
      location: "Chattogram (WASA)",
      logistics: "FoodPanda Tracking",
      status: "Driver Assigned",
      driverName: "Tanvir Hossain",
      driverPhone: "+880 1912-001122",
      foodType: "Chow Mein, Pastry, Fried Rice (~15 meals)",
      eta: "~25 mins",
      coords: [22.3683, 91.8252]
    }
  ];

  const alerts = [
    { time: "9:45 AM", text: "AP1001 vehicle near Agrabad Signal.", type: "info" },
    { time: "9:30 AM", text: "AP1002 picked up successfully (By Self).", type: "success" },
    { time: "8:55 AM", text: "AP1001 driver reassigned to Rahim Uddin.", type: "warning" },
    { time: "8:30 AM", text: "New pickup AP1003 available from Restaurant Name 2.", type: "info" },
  ];

  // Filtered Pickups Array
  const filteredPickups = activePickups.filter(
    item => filterStatus === 'ALL' || item.status === filterStatus
  );

  // Slice arrays to show only top 2 by default
  const displayedPickups = showAllPickups ? filteredPickups : filteredPickups.slice(0, 2);
  const displayedAlerts = showAllAlerts ? alerts : alerts.slice(0, 2);

  return (
    <div className="ar-container">
      
      {/* Top Banner Header */}
      <div className="ar-top-banner">
        <div>
          <h2 className="ar-banner-title">ACTIVE PICKUPS: Comprehensive Monitoring (In Progress)</h2>
         
          <div className="ar-filter-btns">
            {['ALL', 'In Transit', 'Picked Up'].map((st) => (
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
          {displayedPickups.map((pickup) => (
            <div key={pickup.id} className="ar-pickup-card">
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
                    <button className="ar-btn-archive">
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
          ))}

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
            {displayedAlerts.map((al, idx) => (
              <div key={idx} className="ar-alert-card">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {al.time}
                  </span>
                  <span className="uppercase text-[9px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">Live</span>
                </div>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">{al.text}</p>
              </div>
            ))}
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
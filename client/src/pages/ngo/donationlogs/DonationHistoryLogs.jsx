import React, { useState } from 'react';
import { Trophy, ChevronUp, ChevronDown, Star } from 'lucide-react';
import './DonationHistoryLogs.css'; // আলাদা সিএসএস ফাইল ইমপোর্ট করা হলো

export default function DonationHistoryLogs() {
  // pagination/view limit state
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonor, setSelectedDonor] = useState('ALL');
  const [selectedFoodType, setSelectedFoodType] = useState('ALL');
  const [selectedLogistics, setSelectedLogistics] = useState('ALL');

  // Logs Overview Popup State & Timeframe
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
  const [overviewTimeframe, setOverviewTimeframe] = useState('30_days');

  // Sidebar Collapse/Expand State
  const [isExpanded, setIsExpanded] = useState(true);

  // Dynamic Overview Data based on Selected Timeframe in Popup
  const overviewStats = {
    today: {
      label: "Today's Donation Impact Statistics",
      totalCollected: 12,
      trustScore: "4.8",
      topFood: "Prepared Meal 🍲",
      logistics: "FoodPanda Express",
      totalMeals: "~45 Meals Today"
    },
    '1_week': {
      label: "7-Day Donation Impact Statistics",
      totalCollected: 58,
      trustScore: "4.5",
      topFood: "Prepared Meal 🍲",
      logistics: "FoodPanda Express",
      totalMeals: "~160 Meals This Week"
    },
    '15_days': {
      label: "15-Day Donation Impact Statistics",
      totalCollected: 110,
      trustScore: "4.4",
      topFood: "Rice & Curry 🍛",
      logistics: "By Self",
      totalMeals: "~290 Meals in 15 Days"
    },
    '30_days': {
      label: "30-Day Donation Impact Statistics",
      totalCollected: 210,
      trustScore: "4.3",
      topFood: "Prepared Meal 🍲",
      logistics: "FoodPanda Express",
      totalMeals: "~550 Meals This Month"
    },
    '1_year': {
      label: "1-Year Cumulative Impact Statistics",
      totalCollected: 2450,
      trustScore: "4.6",
      topFood: "Prepared Meal 🍲",
      logistics: "FoodPanda Express",
      totalMeals: "~6,800 Meals This Year"
    },
    '2_years': {
      label: "2-Year Cumulative Impact Statistics",
      totalCollected: 5120,
      trustScore: "4.7",
      topFood: "Prepared Meal 🍲",
      logistics: "FoodPanda Express",
      totalMeals: "~14,500 Meals in 2 Years"
    },
    '4_years': {
      label: "4-Year Cumulative Impact Statistics",
      totalCollected: 10800,
      trustScore: "4.8",
      topFood: "Prepared Meal 🍲",
      logistics: "FoodPanda Express",
      totalMeals: "~31,000 Meals in 4 Years"
    }
  };

  const currentOverview = overviewStats[overviewTimeframe];

  // Donation Table Dummy Data
  const logsData = [
    { id: "DH1005", date: "9/15 @ 10:15 PM", donor: "Café 1", trust: "4.5", food: "Rice & Curry (Meal 🍲)", qty: "~30", logistics: "FoodPanda", status: "Delivered", rating: 5, location: "Agrabad" },
    { id: "DH1004", date: "9/14 @ 11:30 AM", donor: "Restaurant 2", trust: "4.2", food: "Burgers (Meal 🍔)", qty: "~25", logistics: "By Self", status: "Picked Up", rating: 4, location: "GEC Circle" },
    { id: "DH1003", date: "9/14 @ 11:30 AM", donor: "Restaurant 2", trust: "4.3", food: "Burgers (Meal 🍔)", qty: "~25", logistics: "By Self", status: "Picked Up", rating: 4, location: "GEC Circle" },
    { id: "DH1002", date: "9/14 @ 11:30 AM", donor: "Café 1", trust: "4.5", food: "Burgers (Meal 🍔)", qty: "~25", logistics: "By Self", status: "Picked Up", rating: 5, location: "Agrabad" },
    { id: "DH1001", date: "9/13 @ 11:30 AM", donor: "Restaurant 2", trust: "4.2", food: "Burgers (Meal 🍔)", qty: "~30", logistics: "FoodPanda", status: "Delivered", rating: 4, location: "WASA" },
    { id: "DH1000", date: "9/13 @ 10:30 PM", donor: "Café 1", trust: "4.5", food: "Rice & Curry (Meal 🍲)", qty: "~30", logistics: "FoodPanda", status: "Delivered", rating: 5, location: "Agrabad" },
    { id: "DH1009", date: "9/13 @ 11:30 AM", donor: "Café 1", trust: "4.5", food: "Burgers (Meal 🍔)", qty: "~25", logistics: "FoodPanda", status: "Delivered", rating: 5, location: "Agrabad" },
  ];

  // Filtering Logic
  const filteredLogs = logsData.filter((log) => {
    const matchesSearch = log.id.toLowerCase().includes(searchTerm.toLowerCase()) || log.donor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDonor = selectedDonor === 'ALL' || log.donor === selectedDonor;
    const matchesFood = selectedFoodType === 'ALL' || log.food.includes(selectedFoodType);
    const matchesLogistics = selectedLogistics === 'ALL' || log.logistics === selectedLogistics;
    return matchesSearch && matchesDonor && matchesFood && matchesLogistics;
  });

  const displayedLogs = showAllLogs ? filteredLogs : filteredLogs.slice(0, 4);

  return (
    <div className="dhl-container">
      
      {/* TOP HEADER SECTION */}
      <div className="dhl-header">
        <div>
          <div className="dhl-title-group">
            <span className="text-xl">📦</span>
            <h2 className="dhl-title">HISTORY & LOGS: Completed Donations</h2>
          </div>
          <p className="dhl-subtitle">Verified NGO donation audit records, proof receipts & feedback tracking</p>
        </div>
        <button className="dhl-export-btn">
          <span>📥</span> EXPORT REPORT (CSV/PDF)
        </button>
      </div>

      {/* FILTER & SEARCH BAR PANEL */}
      <div className="dhl-filters-panel">
        <div>
          <label className="dhl-filter-label">Date Range</label>
          <select className="dhl-filter-select">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>This Month</option>
          </select>
        </div>

        <div>
          <label className="dhl-filter-label">Donor</label>
          <select 
            value={selectedDonor} 
            onChange={(e) => setSelectedDonor(e.target.value)}
            className="dhl-filter-select"
          >
            <option value="ALL">All Donors</option>
            <option value="Café 1">Café 1</option>
            <option value="Restaurant 2">Restaurant 2</option>
          </select>
        </div>

        <div>
          <label className="dhl-filter-label">Food Type</label>
          <select 
            value={selectedFoodType} 
            onChange={(e) => setSelectedFoodType(e.target.value)}
            className="dhl-filter-select"
          >
            <option value="ALL">All Types</option>
            <option value="Rice">Rice & Curry</option>
            <option value="Burgers">Burgers</option>
          </select>
        </div>

        <div>
          <label className="dhl-filter-label">Logistics</label>
          <select 
            value={selectedLogistics} 
            onChange={(e) => setSelectedLogistics(e.target.value)}
            className="dhl-filter-select"
          >
            <option value="ALL">FoodPanda & Self</option>
            <option value="FoodPanda">FoodPanda</option>
            <option value="By Self">By Self</option>
          </select>
        </div>

        <div>
          <label className="dhl-filter-label">Location</label>
          <select className="dhl-filter-select">
            <option>All Locations</option>
            <option>Agrabad</option>
            <option>GEC Circle</option>
            <option>WASA</option>
          </select>
        </div>

        <div>
          <label className="dhl-filter-label">Search ID / Donor</label>
          <input 
            type="text" 
            placeholder="e.g. DH1005" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dhl-filter-input"
          />
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="dhl-main-grid">
        
        {/* LEFT 9 COLUMNS: LOGS TABLE */}
        <div className="dhl-table-col">
          <div className="dhl-table-header">
            <div>
              <h3 className="dhl-table-title">DONATION HISTORY LOGS</h3>
              <p className="text-[11px] text-slate-400">Showing latest verified food donation records</p>
            </div>
            <span className="dhl-records-badge">
              {filteredLogs.length} Records Found
            </span>
          </div>

          <div className="dhl-table-wrapper">
            <table className="dhl-custom-table">
              <thead>
                <tr>
                  <th className="p-3">Donation ID</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Donor</th>
                  <th className="p-3">Food Type</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Logistics</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {displayedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{log.id}</td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">{log.date}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800 block">{log.donor}</span>
                      <span className="text-[10px] text-amber-500 font-semibold">★ {log.trust}</span>
                    </td>
                    <td className="p-3 text-slate-700">{log.food}</td>
                    <td className="p-3 font-bold text-slate-900">{log.qty}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        log.logistics === 'FoodPanda' ? 'bg-pink-50 text-pink-600 border border-pink-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}>
                        🚚 {log.logistics}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        log.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        ✓ {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-amber-400 font-bold whitespace-nowrap">
                      {"★".repeat(log.rating)}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1 items-center">
                        <button 
                          onClick={() => setSelectedReceipt(log)}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1 px-2 rounded-md border border-slate-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          📄 View Receipt
                        </button>
                        <button className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold py-1 px-2 rounded-md border border-emerald-200 flex items-center justify-center gap-1 transition-colors cursor-pointer">
                          💬 Feedback
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length > 4 && (
            <button
              onClick={() => setShowAllLogs(!showAllLogs)}
              className="dhl-see-more-btn"
            >
              <span>{showAllLogs ? "SHOW LESS LOGS" : `SEE MORE LOGS (${filteredLogs.length - 4} MORE)`}</span>
              <span>{showAllLogs ? "▲" : "▼"}</span>
            </button>
          )}
        </div>

        {/* RIGHT 3 COLUMNS: COLLAPSIBLE OVERVIEW CARD WITH FILTER MODAL TRIGGER */}
        <div className="dhl-overview-col">
          <div className="dhl-overview-card">
            
            {/* Header & Toggle / Filter Actions */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div 
                onClick={() => setIsOverviewModalOpen(true)}
                className="flex items-center gap-2 cursor-pointer group flex-1"
                title="Click to change timeframe"
              >
                <Trophy className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-sm tracking-wide group-hover:text-emerald-600 transition-colors">OVERVIEW</h3>
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded-full">Filter ⚙️</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{currentOverview.label}</p>
                </div>
              </div>

              {/* Collapse/Expand Toggle Button */}
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors ml-2 cursor-pointer border-none"
                title={isExpanded ? "Collapse Overview" : "Expand Overview"}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Collapsible Content */}
            {isExpanded && (
              <div className="space-y-3 transition-all">
                
                <div 
                  onClick={() => setIsOverviewModalOpen(true)}
                  className="dhl-overview-item"
                >
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Donations Collected</p>
                  <h4 className="text-3xl font-black text-emerald-600 mt-1">{currentOverview.totalCollected}</h4>
                </div>

                <div 
                  onClick={() => setIsOverviewModalOpen(true)}
                  className="dhl-overview-item"
                >
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Average Donor Trust Score</p>
                  <h4 className="text-2xl font-black text-amber-500 mt-1">{currentOverview.trustScore} <span className="text-sm">★</span></h4>
                </div>

                <div 
                  onClick={() => setIsOverviewModalOpen(true)}
                  className="dhl-overview-item"
                >
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Most Collected Food</p>
                  <h4 className="text-sm font-bold text-slate-700 mt-1">{currentOverview.topFood}</h4>
                </div>

                <div 
                  onClick={() => setIsOverviewModalOpen(true)}
                  className="dhl-overview-item"
                >
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Top Logistics Partner</p>
                  <h4 className="text-sm font-bold text-pink-600 mt-1">{currentOverview.logistics}</h4>
                </div>

                {/* Total Impact Footer Badge */}
                <div className="pt-2 border-t border-slate-100 text-center">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 inline-block">
                    🌱 {currentOverview.totalMeals}
                  </span>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

      {/* 🔴 TIMEFRAME SELECTION POPUP MODAL */}
      {isOverviewModalOpen && (
        <div className="dhl-modal-backdrop">
          <div className="dhl-modal-box">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Select Overview Timeframe</h3>
                <p className="text-[11px] text-slate-500">Choose period for impact statistics</p>
              </div>
              <button onClick={() => setIsOverviewModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer border-none bg-transparent">✕</button>
            </div>

            {/* Timeframe Options List */}
            <div className="space-y-2 text-xs font-semibold">
              {[
                { id: 'today', label: 'Today (1 Day)' },
                { id: '1_week', label: '1 Week (7 Days)' },
                { id: '15_days', label: '15 Days' },
                { id: '30_days', label: '30 Days (1 Month)' },
                { id: '1_year', label: '1 Year' },
                { id: '2_years', label: '2 Years' },
                { id: '4_years', label: '4 Years' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setOverviewTimeframe(item.id);
                    setIsOverviewModalOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all flex justify-between items-center cursor-pointer ${
                    overviewTimeframe === item.id 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold shadow-sm' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {overviewTimeframe === item.id && <span className="text-emerald-600 font-bold">✓ Selected</span>}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setIsOverviewModalOpen(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors mt-2 cursor-pointer border-none"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 🧾 DIGITAL RECEIPT MODAL POPUP */}
      {selectedReceipt && (
        <div className="dhl-modal-backdrop">
          <div className="dhl-modal-box" style={{ maxWidth: '28rem' }}>
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Verified Donation Receipt</h3>
                <p className="text-xs text-emerald-600 font-bold">FeedLink NGO Audit Portal</p>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer border-none bg-transparent">✕</button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt ID:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Donor Name:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.donor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Food Items:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.food}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Logistics Transport:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.logistics}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-700">Verification Status:</span>
                <span className="font-extrabold text-emerald-600">✓ NGO Received & Signed</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer border-none">
                Print / Save Receipt
              </button>
              <button onClick={() => setSelectedReceipt(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer border-none">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
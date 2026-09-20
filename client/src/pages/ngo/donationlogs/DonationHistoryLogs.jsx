import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, ChevronUp, ChevronDown } from 'lucide-react';
import './DonationHistoryLogs.css';

export default function DonationHistoryLogs() {
  const [logsData, setLogsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filter States
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonor, setSelectedDonor] = useState('ALL');
  const [selectedFoodType, setSelectedFoodType] = useState('ALL');
  const [selectedLogistics, setSelectedLogistics] = useState('ALL');

  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
  const [overviewTimeframe, setOverviewTimeframe] = useState('30_days');
  const [isExpanded, setIsExpanded] = useState(true);

  // 🌐 MongoDB Database থেকে API এর মাধ্যমে ডেটা ফেচ করা
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/donation-logs/all');
        if (res.data.success) {
          setLogsData(res.data.data);
        }
      } catch (err) {
        console.error("Database fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filter Logic
  const filteredLogs = logsData.filter((log) => {
    const donorName = log.donorId?.name || log.donor || '';
    const matchesSearch = (log.donationId || log._id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          donorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDonor = selectedDonor === 'ALL' || donorName === selectedDonor;
    const matchesFood = selectedFoodType === 'ALL' || (log.foodType || log.food || '').includes(selectedFoodType);
    const matchesLogistics = selectedLogistics === 'ALL' || (log.logistics || '') === selectedLogistics;
    
    return matchesSearch && matchesDonor && matchesFood && matchesLogistics;
  });

  const displayedLogs = showAllLogs ? filteredLogs : filteredLogs.slice(0, 4);

  return (
    <div className="dhl-container">
      {/* HEADER SECTION */}
      <div className="dhl-header">
        <div>
          <div className="dhl-title-group">
            <span className="text-xl">📦</span>
            <h2 className="dhl-title">HISTORY & LOGS: Completed Donations</h2>
          </div>
          <p className="dhl-subtitle">Verified NGO donation audit records & proof receipts</p>
        </div>
        <button className="dhl-export-btn">
          <span>📥</span> EXPORT REPORT
        </button>
      </div>

      {/* FILTERS PANEL */}
      <div className="dhl-filters-panel">
        <div>
          <label className="dhl-filter-label">Search ID / Donor</label>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dhl-filter-input"
          />
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="dhl-main-grid">
        <div className="dhl-table-col">
          <div className="dhl-table-header">
            <div>
              <h3 className="dhl-table-title">DONATION HISTORY LOGS</h3>
              <p className="text-[11px] text-slate-400">Live MongoDB Database Logs</p>
            </div>
            <span className="dhl-records-badge">
              {filteredLogs.length} Records Found
            </span>
          </div>

          <div className="dhl-table-wrapper">
            {loading ? (
              <div className="p-8 text-center text-slate-500 font-bold">Loading Database Records...</div>
            ) : (
              <table className="dhl-custom-table">
                <thead>
                  <tr>
                    <th className="p-3">Donation ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Donor</th>
                    <th className="p-3">Food Type</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {displayedLogs.map((log) => (
                    <tr key={log._id || log.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{log.donationId || log._id?.slice(-6)}</td>
                      <td className="p-3 text-slate-500">{new Date(log.createdAt || Date.now()).toLocaleDateString()}</td>
                      <td className="p-3 font-bold text-slate-800">{log.donorId?.name || log.donor || "N/A"}</td>
                      <td className="p-3 text-slate-700">{log.foodType || log.food}</td>
                      <td className="p-3 font-bold text-slate-900">{log.quantity || log.qty}</td>
                      <td className="p-3">
                        <span className="bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-md text-[10px]">
                          ✓ {log.status || "Delivered"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => setSelectedReceipt(log)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1 px-2 rounded-md border border-slate-300"
                        >
                          📄 View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {filteredLogs.length > 4 && (
            <button onClick={() => setShowAllLogs(!showAllLogs)} className="dhl-see-more-btn">
              <span>{showAllLogs ? "SHOW LESS" : `SEE MORE LOGS (${filteredLogs.length - 4} MORE)`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
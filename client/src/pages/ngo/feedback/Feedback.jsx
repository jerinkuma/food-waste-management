import React, { useState } from 'react';
import './Feedback.css'; // সিএসএস ফাইলটি এখানে ইমপোর্ট করা হয়েছে

export default function Feedback() {
  // Form States
  const [selectedDonationId, setSelectedDonationId] = useState('DH1005');
  const [feedbackCategory, setFeedbackCategory] = useState('General Feedback');
  const [priorityLevel, setPriorityLevel] = useState('Normal');
  const [detailsText, setDetailsText] = useState('');
  const [selectedCheckboxes, setSelectedCheckboxes] = useState({
    lateArrival: false,
    foodQualityIssue: false,
    communicationIssue: false,
    quantityMismatch: false,
    packagingIssue: false,
  });

  // Dummy Previous Tickets/Feedback Data (Without Ratings)
  const [previousFeedback, setPreviousFeedback] = useState([
    { id: "DH1004", donor: "Restaurant 2", category: "Late Arrival", date: "9/14", status: "Resolved", priority: "Normal" },
    { id: "DH1003", donor: "Restaurant 2", category: "Food Quality Issue", date: "9/14", status: "Closed", priority: "High" },
    { id: "DH1002", donor: "Café 1", category: "General Feedback", date: "9/13", status: "Closed", priority: "Low" },
    { id: "DH1009", donor: "Café 1", category: "Packaging Issue", date: "9/13", status: "Resolved", priority: "Normal" },
  ]);

  // Handle Checkbox Change
  const handleCheckboxChange = (e) => {
    setSelectedCheckboxes({
      ...selectedCheckboxes,
      [e.target.name]: e.target.checked
    });
  };

  // Submit Feedback Form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!detailsText.trim()) {
      alert("Please describe your feedback before submitting.");
      return;
    }

    const newFeedback = {
      id: selectedDonationId || "GENERAL",
      donor: selectedDonationId === 'DH1005' ? 'Café 1' : 'Selected Donor',
      category: feedbackCategory,
      date: "Today",
      status: "Under Review",
      priority: priorityLevel
    };

    setPreviousFeedback([newFeedback, ...previousFeedback]);
    setDetailsText('');
    alert("Thank you! Your feedback ticket has been submitted successfully to the FeedLink Support Team.");
  };

  // Email Reporting System Trigger
  const handleReportViaEmail = () => {
    const subject = encodeURIComponent(`[NGO Report] Issue Regarding Donation ${selectedDonationId}`);
    const body = encodeURIComponent(
      `Hello FeedLink Audit & Support Team,\n\nI want to report an issue regarding Donation ID: ${selectedDonationId}.\n\nCategory: ${feedbackCategory}\nPriority: ${priorityLevel}\n\nDetails / Incidents:\n${detailsText || '[Write details here]'}\n\nPlease look into this matter.\n\nThank you,\nNGO Representative`
    );
    window.location.href = `mailto:support@feedlink.org?subject=${subject}&body=${body}`;
  };

  return (
    <div className="feedlink-container">
      
      {/* HEADER SECTION */}
      <div className="feedlink-header">
        <div>
          <div className="feedlink-header-title">
            <span className="feedlink-icon">💬</span>
            <h2>FEEDBACK & INCIDENT REPORTING</h2>
          </div>
          <p className="feedlink-header-subtitle">Submit operational feedback, delivery issues, or report donor non-compliance</p>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="feedlink-grid">
        
        {/* LEFT 7 COLUMNS: SUBMIT NEW FEEDBACK FORM */}
        <div className="feedlink-card feedlink-form-section">
          <div className="feedlink-section-header">
            <h3>SUBMIT NEW FEEDBACK / REPORT</h3>
            <p>Fill in the form below to register your feedback or report an issue</p>
          </div>

          <form onSubmit={handleSubmit} className="feedlink-form">
            
            {/* Donation ID & Category Row */}
            <div className="feedlink-row">
              <div className="feedlink-field">
                <label className="feedlink-label">
                  Select Donation ID (Optional)
                </label>
                <select 
                  value={selectedDonationId}
                  onChange={(e) => setSelectedDonationId(e.target.value)}
                  className="feedlink-select"
                >
                  <option value="DH1005">DH1005 - Café 1 (Agrabad)</option>
                  <option value="DH1004">DH1004 - Restaurant 2 (GEC)</option>
                  <option value="DH1003">DH1003 - Restaurant 2 (GEC)</option>
                  <option value="DH1002">DH1002 - Café 1 (Agrabad)</option>
                  <option value="GENERAL">-- General Platform Feedback --</option>
                </select>
              </div>

              <div className="feedlink-field">
                <label className="feedlink-label">
                  Feedback Category
                </label>
                <select 
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  className="feedlink-select"
                >
                  <option value="General Feedback">General App Feedback</option>
                  <option value="Food Quality Issue">Food Quality / Spoilage</option>
                  <option value="Late Arrival">Late Logistics Delivery</option>
                  <option value="Quantity Mismatch">Quantity Mismatch</option>
                  <option value="Donor Misbehavior">Donor Misbehavior Report</option>
                </select>
              </div>
            </div>

            {/* Quick Checkboxes for Common Issues */}
            <div>
              <label className="feedlink-label">
                Delivery & Food Related Specific Tags (Select all that apply)
              </label>
              <div className="feedlink-checkbox-grid">
                <label className="feedlink-checkbox-label">
                  <input type="checkbox" name="lateArrival" checked={selectedCheckboxes.lateArrival} onChange={handleCheckboxChange} className="feedlink-checkbox" />
                  <span>Late Arrival</span>
                </label>
                <label className="feedlink-checkbox-label">
                  <input type="checkbox" name="foodQualityIssue" checked={selectedCheckboxes.foodQualityIssue} onChange={handleCheckboxChange} className="feedlink-checkbox" />
                  <span>Food Quality Issue</span>
                </label>
                <label className="feedlink-checkbox-label">
                  <input type="checkbox" name="communicationIssue" checked={selectedCheckboxes.communicationIssue} onChange={handleCheckboxChange} className="feedlink-checkbox" />
                  <span>Communication Issue</span>
                </label>
                <label className="feedlink-checkbox-label">
                  <input type="checkbox" name="quantityMismatch" checked={selectedCheckboxes.quantityMismatch} onChange={handleCheckboxChange} className="feedlink-checkbox" />
                  <span>Quantity Mismatch</span>
                </label>
                <label className="feedlink-checkbox-label">
                  <input type="checkbox" name="packagingIssue" checked={selectedCheckboxes.packagingIssue} onChange={handleCheckboxChange} className="feedlink-checkbox" />
                  <span>Packaging Damaged</span>
                </label>
              </div>
            </div>

            {/* Priority Selection */}
            <div>
              <label className="feedlink-label">
                Priority Level
              </label>
              <div className="feedlink-radio-group">
                {['Low', 'Normal', 'High / Urgent'].map((level) => (
                  <label key={level} className="feedlink-radio-label">
                    <input 
                      type="radio" 
                      name="priority" 
                      value={level} 
                      checked={priorityLevel === level} 
                      onChange={(e) => setPriorityLevel(e.target.value)}
                      className="feedlink-radio" 
                    />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Detailed Feedback Textarea */}
            <div>
              <label className="feedlink-label">
                Detailed Message / Incident Description
              </label>
              <textarea 
                rows="4"
                value={detailsText}
                onChange={(e) => setDetailsText(e.target.value)}
                placeholder="Write your feedback or incident report here in detail (up to 200 words)..."
                className="feedlink-textarea"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="feedlink-action-buttons">
              <button 
                type="submit"
                className="feedlink-submit-btn"
              >
                Submit Feedback 
              </button>
              <button 
                type="button"
                onClick={handleReportViaEmail}
                className="feedlink-email-btn"
              >
                <span>📧 Send Email Report Directly</span>
              </button>
            </div>

          </form>
        </div>

        {/* RIGHT 5 COLUMNS: PREVIOUS FEEDBACK & REPORT TICKETS */}
        <div className="feedlink-sidebar">
          <div className="feedlink-card feedlink-summary-card">
            
            <div className="feedlink-summary-header">
              <div>
                <h3>SUBMITTED FEEDBACK SUMMARY</h3>
                <p>Track status of your reported issues & tickets</p>
              </div>
              <span className="feedlink-badge-count">
                {previousFeedback.length} Feedback
              </span>
            </div>

            {/* Tickets Table */}
            <div className="feedlink-table-responsive">
              <table className="feedlink-table">
                <thead>
                  <tr>
                    <th className="th-left">Date</th>
                    <th>Donation ID</th>
                    <th>Donor</th>
                    <th>Category</th>
                    <th className="th-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previousFeedback.map((item, idx) => (
                    <tr key={idx} className="feedlink-tr">
                      <td className="td-date">{item.date}</td>
                      <td className="td-id">{item.id}</td>
                      <td className="td-donor">{item.donor}</td>
                      <td className="td-category">{item.category}</td>
                      <td>
                        <span className={`feedlink-status-badge ${
                          item.status === 'Resolved' 
                            ? 'status-resolved' 
                            : item.status === 'Under Review'
                            ? 'status-review'
                            : 'status-closed'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Email Support Contact Box */}
            <div className="feedlink-support-box">
              <div className="feedlink-support-title">
                Need Immediate Assistance?
              </div>
              <p className="feedlink-support-desc">
                For urgent complaints regarding food safety or severe donor issues, directly contact our admin department via email:
              </p>
              <a 
                href="mailto:audit@feedlink.org" 
                className="feedlink-support-link"
              >
                ✉️ admin@feedlink.org
              </a>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
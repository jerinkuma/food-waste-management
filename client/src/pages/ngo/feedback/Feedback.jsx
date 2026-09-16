import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../../services/auth';
import { fetchNgoProfile, fetchNgoDonations, submitFeedback, fetchNgoFeedback } from '../../../services/api';
import './Feedback.css';

export default function Feedback() {
  const user = getCurrentUser();

  const [ngoId, setNgoId] = useState(null);
  const [myDonations, setMyDonations] = useState([]); // used to populate the real donation dropdown
  const [selectedDonationId, setSelectedDonationId] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('General App Feedback');
  const [priorityLevel, setPriorityLevel] = useState('Normal');
  const [detailsText, setDetailsText] = useState('');
  const [selectedCheckboxes, setSelectedCheckboxes] = useState({
    lateArrival: false,
    foodQualityIssue: false,
    communicationIssue: false,
    quantityMismatch: false,
    packagingIssue: false,
  });
  const [previousFeedback, setPreviousFeedback] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const profile = await fetchNgoProfile();
        setNgoId(profile?._id || null);

        if (profile?._id) {
          const { active, archived } = await fetchNgoDonations(profile._id);
          const combined = [...(active || []), ...(archived || [])];
          setMyDonations(combined);
          if (combined.length > 0) setSelectedDonationId(combined[0]._id);

          const feedbacks = await fetchNgoFeedback(profile._id);
          setPreviousFeedback(feedbacks);
        }
      } catch (error) {
        console.error('Error loading feedback context:', error);
      }
    })();
  }, []);

  const handleCheckboxChange = (e) => {
    setSelectedCheckboxes({ ...selectedCheckboxes, [e.target.name]: e.target.checked });
  };

  const selectedDonation = myDonations.find((d) => d._id === selectedDonationId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!detailsText.trim()) {
      alert('Please describe your feedback before submitting.');
      return;
    }
    if (!selectedDonation) {
      alert('Please select a donation this feedback relates to (or complete a pickup first).');
      return;
    }

    const tags = Object.keys(selectedCheckboxes).filter((key) => selectedCheckboxes[key]);

    const payload = {
      donationId: selectedDonation.donationId,
      donation: selectedDonation._id,
      ngo: ngoId,
      restaurant: selectedDonation.donor?._id, // <-- this is what dual-routes it to the restaurant's dashboard too
      donorName: selectedDonation.donor?.name || 'Restaurant',
      category: feedbackCategory,
      priority: priorityLevel,
      tags,
      message: detailsText,
      submittedBy: user?.name || 'NGO',
    };

    setSubmitting(true);
    try {
      await submitFeedback(payload);
      alert('Thank you! Your feedback has been sent to both the Admin team and the restaurant.');
      setDetailsText('');
      setSelectedCheckboxes({ lateArrival: false, foodQualityIssue: false, communicationIssue: false, quantityMismatch: false, packagingIssue: false });
      const feedbacks = await fetchNgoFeedback(ngoId);
      setPreviousFeedback(feedbacks);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportViaEmail = () => {
    const subject = encodeURIComponent(`[NGO Report] Issue Regarding Donation ${selectedDonation?.donationId || ''}`);
    const body = encodeURIComponent(
      `Hello FeedLink Audit & Support Team,\n\nI want to report an issue regarding Donation ID: ${selectedDonation?.donationId || ''}.\n\nCategory: ${feedbackCategory}\nPriority: ${priorityLevel}\n\nDetails / Incidents:\n${detailsText || '[Write details here]'}\n\nPlease look into this matter.\n\nThank you,\n${user?.name || 'NGO Representative'}`
    );
    window.location.href = `mailto:admin@feedlink.org?subject=${subject}&body=${body}`;
  };

  return (
    <div className="feedlink-container">
      <div className="feedlink-header">
        <div>
          <div className="feedlink-header-title">
            <span className="feedlink-icon">💬</span>
            <h2>FEEDBACK & INCIDENT REPORTING</h2>
          </div>
          <p className="feedlink-header-subtitle">
            Every submission routes to both the Admin panel and the restaurant's own dashboard in real time.
          </p>
        </div>
      </div>

      <div className="feedlink-grid">
        <div className="feedlink-card feedlink-form-section">
          <div className="feedlink-section-header">
            <h3>SUBMIT NEW FEEDBACK / REPORT</h3>
            <p>Fill in the form below to register your feedback or report an issue</p>
          </div>

          <form onSubmit={handleSubmit} className="feedlink-form">
            <div className="feedlink-row">
              <div className="feedlink-field">
                <label className="feedlink-label">Select Donation</label>
                <select
                  value={selectedDonationId}
                  onChange={(e) => setSelectedDonationId(e.target.value)}
                  className="feedlink-select"
                >
                  {myDonations.length === 0 && <option value="">No completed pickups yet</option>}
                  {myDonations.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.donationId} - {d.donor?.name} ({d.foodName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="feedlink-field">
                <label className="feedlink-label">Feedback Category</label>
                <select value={feedbackCategory} onChange={(e) => setFeedbackCategory(e.target.value)} className="feedlink-select">
                  <option value="General App Feedback">General App Feedback</option>
                  <option value="Food Quality Issue">Food Quality / Spoilage</option>
                  <option value="Late Arrival">Late Logistics Delivery</option>
                  <option value="Quantity Mismatch">Quantity Mismatch</option>
                  <option value="Donor Misbehavior Report">Donor Misbehavior Report</option>
                </select>
              </div>
            </div>

            <div>
              <label className="feedlink-label">Delivery & Food Related Specific Tags (Select all that apply)</label>
              <div className="feedlink-checkbox-grid">
                {[
                  ['lateArrival', 'Late Arrival'],
                  ['foodQualityIssue', 'Food Quality Issue'],
                  ['communicationIssue', 'Communication Issue'],
                  ['quantityMismatch', 'Quantity Mismatch'],
                  ['packagingIssue', 'Packaging Damaged'],
                ].map(([name, label]) => (
                  <label key={name} className="feedlink-checkbox-label">
                    <input type="checkbox" name={name} checked={selectedCheckboxes[name]} onChange={handleCheckboxChange} className="feedlink-checkbox" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="feedlink-label">Priority Level</label>
              <div className="feedlink-radio-group">
                {['Low', 'Normal', 'High / Urgent'].map((level) => (
                  <label key={level} className="feedlink-radio-label">
                    <input type="radio" name="priority" value={level} checked={priorityLevel === level} onChange={(e) => setPriorityLevel(e.target.value)} className="feedlink-radio" />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="feedlink-label">Detailed Message / Incident Description</label>
              <textarea
                rows="4"
                value={detailsText}
                onChange={(e) => setDetailsText(e.target.value)}
                placeholder="Write your feedback or incident report here in detail..."
                className="feedlink-textarea"
              ></textarea>
            </div>

            <div className="feedlink-action-buttons">
              <button type="submit" disabled={submitting} className="feedlink-submit-btn">
                {submitting ? 'Sending to Admin + Restaurant...' : 'Submit Feedback'}
              </button>
              <button type="button" onClick={handleReportViaEmail} className="feedlink-email-btn">
                <span>📧 Send Email Report Directly</span>
              </button>
            </div>
          </form>
        </div>

        <div className="feedlink-sidebar">
          <div className="feedlink-card feedlink-summary-card">
            <div className="feedlink-summary-header">
              <div>
                <h3>SUBMITTED FEEDBACK SUMMARY</h3>
                <p>Track status of your reported issues & tickets</p>
              </div>
              <span className="feedlink-badge-count">{previousFeedback.length} Feedback</span>
            </div>

            <div className="feedlink-table-responsive">
              <table className="feedlink-table">
                <thead>
                  <tr>
                    <th className="th-left">Date</th>
                    <th>Donation ID</th>
                    <th>Restaurant</th>
                    <th>Category</th>
                    <th className="th-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previousFeedback.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>
                        No feedback submitted yet.
                      </td>
                    </tr>
                  ) : (
                    previousFeedback.map((item, idx) => (
                      <tr key={item._id || idx} className="feedlink-tr">
                        <td className="td-date">{item.date || 'Today'}</td>
                        <td className="td-id">{item.donationId}</td>
                        <td className="td-donor">{item.donorName}</td>
                        <td className="td-category">{item.category}</td>
                        <td>
                          <span className={`feedlink-status-badge ${item.restaurantResponse?.message ? 'status-resolved' : 'status-review'}`}>
                            {item.restaurantResponse?.message ? 'Restaurant Replied' : 'Awaiting Response'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="feedlink-support-box">
              <div className="feedlink-support-title">Need Immediate Assistance?</div>
              <p className="feedlink-support-desc">
                For urgent complaints regarding food safety or severe donor issues, directly contact our admin department via email:
              </p>
              <a href="mailto:admin@feedlink.org" className="feedlink-support-link">✉️ admin@feedlink.org</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

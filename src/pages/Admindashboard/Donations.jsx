import React, { useState, useEffect } from 'react';
import { fetchDonations } from '../../services/api';
import './Donations.css';

const Donations = () => {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    setDonations(fetchDonations());
  }, []);

  const updateStatus = (id, newStatus) => {
    setDonations(donations.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  return (
    <div className="page">
      <h1><span className="page-icon">🍱</span> Donation Management</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Food</th><th>Quantity</th><th>Donor</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {donations.map(d => (
              <tr key={d.id}>
                <td><strong>{d.food}</strong></td>
                <td>{d.qty}</td>
                <td>{d.donor}</td>
                <td>{d.date}</td>
                <td><span className={`badge ${d.status.toLowerCase()}`}>{d.status}</span></td>
                <td className="actions">
                  {d.status === 'Pending' && (
                    <>
                      <button className="btn-approve" onClick={() => updateStatus(d.id, 'Accepted')}>Approve</button>
                      <button className="btn-reject" onClick={() => updateStatus(d.id, 'Rejected')}>Reject</button>
                    </>
                  )}
                  {d.status === 'Accepted' && (
                    <button className="btn-deliver" onClick={() => updateStatus(d.id, 'Delivered')}>Deliver</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Donations;
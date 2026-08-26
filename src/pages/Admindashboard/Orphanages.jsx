import React, { useState, useEffect } from 'react';
import { fetchOrphanages } from '../../services/api';
import './Orphanages.css';

const Orphanages = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    setRequests(fetchOrphanages());
  }, []);

  const updateStatus = (id, status) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="page">
      <h1><span className="page-icon">🏠</span> Orphanage Requests</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Orphanage</th><th>Requested Food</th><th>Quantity</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong></td>
                <td>{r.food}</td>
                <td>{r.qty}</td>
                <td><span className={`badge ${r.status.toLowerCase()}`}>{r.status}</span></td>
                <td className="actions">
                  {r.status === 'Pending' && (
                    <>
                      <button className="btn-approve" onClick={() => updateStatus(r.id, 'Accepted')}>Accept</button>
                      <button className="btn-reject" onClick={() => updateStatus(r.id, 'Rejected')}>Reject</button>
                    </>
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

export default Orphanages;
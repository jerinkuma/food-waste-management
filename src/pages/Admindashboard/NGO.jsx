import React, { useState, useEffect } from 'react';
import { fetchNGO } from '../../services/api';
import './NGO.css';

const NGO = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    setRequests(fetchNGO());
  }, []);

  const updateStatus = (id, status) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="page">
      <h1><span className="page-icon">🏠</span> NGO Requests</h1>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>NGO</th>
              <th>Requested Food</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
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

export default NGO;
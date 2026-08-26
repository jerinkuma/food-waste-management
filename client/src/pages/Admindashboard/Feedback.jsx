import React, { useState, useEffect } from 'react';
import { fetchFeedback } from '../../services/api';
import './Feedback.css';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    setFeedbacks(fetchFeedback());
  }, []);

  return (
    <div className="page">
      <h1><span className="page-icon">💬</span> Feedback</h1>
      <div className="feedback-list">
        {feedbacks.map(f => (
          <div key={f.id} className="feedback-item">
            <div className="feedback-header">
              <strong>{f.from}</strong>
              <span className="rating">⭐ {f.rating}</span>
            </div>
            <p>{f.message}</p>
            <small className="time">{f.time}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feedback;
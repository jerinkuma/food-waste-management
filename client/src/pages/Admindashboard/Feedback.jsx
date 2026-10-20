
import React, { useEffect, useMemo, useState } from "react";
import { fetchFeedback } from "../../services/api";
import "./Feedback.css";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadFeedback = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchFeedback();

        const list = Array.isArray(response)
          ? response
          : response?.feedbacks || response?.feedback || [];

        if (isMounted) {
          setFeedbacks(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Failed to load feedback:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Feedback load করা যায়নি।"
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFeedback();

    return () => {
      isMounted = false;
    };
  }, []);

  const getName = (feedback) => {
    const sender = feedback.from || feedback.user || feedback.name;

    if (typeof sender === "object" && sender !== null) {
      return sender.name || sender.email || "Anonymous";
    }

    return sender || "Anonymous";
  };

  const getMessage = (feedback) =>
    feedback.message || feedback.comment || feedback.feedback || "";

  const getRating = (feedback) =>
    feedback.rating ?? feedback.score ?? null;

  const formatDate = (date) => {
    if (!date) return "Date not provided";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredFeedbacks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return feedbacks;

    return feedbacks.filter((feedback) => {
      const fields = [
        getName(feedback),
        getMessage(feedback),
        getRating(feedback),
      ];

      return fields.some((field) =>
        String(field ?? "").toLowerCase().includes(query)
      );
    });
  }, [feedbacks, search]);

  return (
    <div className="page">
      <h1>
        <span className="page-icon">💬</span> Feedback Management
      </h1>

      <div className="feedback-summary">
        <div className="feedback-summary-card">
          <span>Total Feedback</span>
          <strong>{loading ? "..." : feedbacks.length}</strong>
          <small>Feedback received from users</small>
        </div>
      </div>

      <div className="feedback-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, message or rating..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="feedback-state">
          Loading feedback from database...
        </div>
      ) : error ? (
        <div className="feedback-state feedback-error">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <p className="feedback-results">
            Showing <strong>{filteredFeedbacks.length}</strong> of{" "}
            <strong>{feedbacks.length}</strong> feedback entries
          </p>

          <div className="feedback-list">
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map((feedback, index) => {
                const rating = getRating(feedback);

                return (
                  <div
                    className="feedback-item"
                    key={feedback._id || feedback.id || index}
                  >
                    <div className="feedback-header">
                      <strong>{getName(feedback)}</strong>

                      {rating !== null && rating !== "" && (
                        <span className="rating">
                          ⭐ {rating}
                        </span>
                      )}
                    </div>

                    <p>
                      {getMessage(feedback) || "No message provided."}
                    </p>

                    <small className="time">
                      {formatDate(
                        feedback.createdAt ||
                          feedback.date ||
                          feedback.time
                      )}
                    </small>
                  </div>
                );
              })
            ) : (
              <div className="feedback-state">
                {search.trim()
                  ? "No feedback matches your search."
                  : "No feedback found in the database."}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Feedback;

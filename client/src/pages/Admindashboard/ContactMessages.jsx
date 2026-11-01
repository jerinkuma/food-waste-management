import React, { useEffect, useState } from "react";
import {
  Search,
  Mail,
  User,
  Calendar,
  MessageSquare,
  Send,
  Loader2,
  RefreshCw,
  X,
  Inbox,
  CheckCircle2,
  Clock3,
  Reply,
  ChevronRight,
  MailOpen,
  Sparkles,
} from "lucide-react";

import {
  fetchAdminContactMessages,
  updateContactMessageStatus,
  replyToContactMessage,
} from "../../services/api";

import "./ContactMessages.css";

const statuses = ["New", "Read", "Replied", "Resolved"];

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [reply, setReply] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================
  // LOAD CONTACT MESSAGES
  // =====================================

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchAdminContactMessages({
        search: search.trim(),
        status: statusFilter,
      });

      setMessages(data);

      setSelectedMessage((previous) => {
        if (!previous) return null;

        return (
          data.find((item) => item._id === previous._id) || null
        );
      });
    } catch (err) {
      console.error("Contact messages fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load contact messages."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMessages();
    }, 350);

    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  // =====================================
  // SELECT MESSAGE
  // =====================================

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    setReply("");
    setSuccess("");
    setError("");

    if (message.status === "New") {
      try {
        const result = await updateContactMessageStatus(
          message._id,
          "Read"
        );

        setSelectedMessage(result.contact);

        setMessages((previous) =>
          previous.map((item) =>
            item._id === message._id ? result.contact : item
          )
        );
      } catch (err) {
        console.error("Mark message as read error:", err);
      }
    }
  };

  // =====================================
  // UPDATE STATUS
  // =====================================

  const handleStatusChange = async (messageId, status) => {
    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const result = await updateContactMessageStatus(
        messageId,
        status
      );

      setMessages((previous) =>
        previous.map((item) =>
          item._id === messageId ? result.contact : item
        )
      );

      if (selectedMessage?._id === messageId) {
        setSelectedMessage(result.contact);
      }

      setSuccess("Message status updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update message status."
      );
    } finally {
      setUpdating(false);
    }
  };

  // =====================================
  // SEND REPLY
  // =====================================

  const handleReply = async (event) => {
    event.preventDefault();

    if (!reply.trim() || !selectedMessage) {
      setError("Please write a reply first.");
      return;
    }

    try {
      setSendingReply(true);
      setError("");
      setSuccess("");

      const messageId = selectedMessage._id;

      const result = await replyToContactMessage(
        messageId,
        reply.trim()
      );

      setSelectedMessage(result.contact);

      setMessages((previous) =>
        previous.map((item) =>
          item._id === messageId ? result.contact : item
        )
      );

      setReply("");
      setSuccess("Reply email sent successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send reply email."
      );
    } finally {
      setSendingReply(false);
    }
  };

  // =====================================
  // HELPERS
  // =====================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatShortDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusClass = (status) => {
    return `contact-status status-${status?.toLowerCase()}`;
  };

  const newCount = messages.filter(
    (item) => item.status === "New"
  ).length;

  const repliedCount = messages.filter(
    (item) => item.status === "Replied"
  ).length;

  const resolvedCount = messages.filter(
    (item) => item.status === "Resolved"
  ).length;

  // =====================================
  // UI
  // =====================================

  return (
    <div className="contact-messages-page">

      {/* PAGE HEADER */}

      <div className="contact-page-header">
        <div className="contact-heading-content">
          <div className="contact-heading-icon">
            <Mail size={23} />
          </div>

          <div>
            <div className="contact-eyebrow">
              FEEDLINK ADMINISTRATION
            </div>

            <h1>Contact Messages</h1>

            <p>
              Manage conversations and stay connected with your visitors.
            </p>
          </div>
        </div>

        <button
          className="contact-refresh-btn"
          onClick={loadMessages}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "spin" : ""}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="contact-summary">

        <div className="contact-summary-card total-card">
          <div className="summary-card-icon">
            <Inbox size={22} />
          </div>

          <div className="summary-card-info">
            <span>Total Messages</span>
            <h3>{messages.length}</h3>
            <small>Messages in current results</small>
          </div>
        </div>

        <div className="contact-summary-card new-card">
          <div className="summary-card-icon">
            <MailOpen size={22} />
          </div>

          <div className="summary-card-info">
            <span>New Messages</span>
            <h3>{newCount}</h3>
            <small>Awaiting attention</small>
          </div>
        </div>

        <div className="contact-summary-card replied-card">
          <div className="summary-card-icon">
            <Reply size={22} />
          </div>

          <div className="summary-card-info">
            <span>Replied</span>
            <h3>{repliedCount}</h3>
            <small>Responses sent</small>
          </div>
        </div>

        <div className="contact-summary-card resolved-card">
          <div className="summary-card-icon">
            <CheckCircle2 size={22} />
          </div>

          <div className="summary-card-info">
            <span>Resolved</span>
            <h3>{resolvedCount}</h3>
            <small>Successfully completed</small>
          </div>
        </div>

      </div>

      {/* ALERTS */}

      {error && (
        <div className="contact-alert error">
          <X size={17} />
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="contact-alert success">
          <CheckCircle2 size={17} />
          <span>{success}</span>
          <button onClick={() => setSuccess("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* MAIN INBOX */}

      <div className="contact-inbox-container">

        {/* INBOX LEFT PANEL */}

        <div className="contact-inbox-panel">

          <div className="contact-inbox-header">
            <div>
              <h2>
                <Inbox size={19} />
                Inbox
              </h2>

              <p>Manage incoming messages</p>
            </div>

            <span className="contact-message-count">
              {messages.length}
            </span>
          </div>

          {/* SEARCH AND FILTER */}

          <div className="contact-toolbar">

            <div className="contact-search">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <select
              className="contact-filter-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="">All Statuses</option>

              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

          </div>

          {/* MESSAGE LIST */}

          <div className="contact-list">

            {loading ? (
              <div className="contact-empty">
                <Loader2 className="spin" size={30} />
                <h3>Loading messages</h3>
                <p>Please wait while we fetch your inbox.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="contact-empty">
                <div className="contact-empty-icon">
                  <Mail size={30} />
                </div>

                <h3>No messages found</h3>
                <p>
                  New visitor messages will appear here.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <button
                  type="button"
                  key={message._id}
                  className={`contact-message-item ${
                    selectedMessage?._id === message._id
                      ? "selected"
                      : ""
                  } ${
                    message.status === "New" ? "unread" : ""
                  }`}
                  onClick={() => handleSelectMessage(message)}
                >

                  <div className="contact-item-top">

                    <div className="contact-avatar">
                      {message.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="contact-item-identity">
                      <strong>{message.name}</strong>
                      <span>{message.email}</span>
                    </div>

                    <span className="contact-item-date">
                      {formatShortDate(message.createdAt)}
                    </span>

                  </div>

                  <div className="contact-item-content">
                    <div className="contact-item-subject">
                      {message.subject}
                    </div>

                    <p className="contact-item-preview">
                      {message.message}
                    </p>
                  </div>

                  <div className="contact-item-bottom">
                    <span className={statusClass(message.status)}>
                      {message.status}
                    </span>

                    <ChevronRight size={16} />
                  </div>

                </button>
              ))
            )}

          </div>

        </div>

        {/* MESSAGE DETAILS RIGHT PANEL */}

        <div className="contact-details">

          {!selectedMessage ? (
            <div className="contact-details-empty">

              <div className="contact-details-empty-icon">
                <MessageSquare size={36} />
              </div>

              <h2>Select a conversation</h2>

              <p>
                Choose a message from your inbox to view its details,
                manage its status and reply to the visitor.
              </p>

              <div className="contact-empty-hint">
                <Sparkles size={15} />
                Your FeedLink conversations appear here
              </div>

            </div>
          ) : (
            <>

              {/* DETAILS HEADER */}

              <div className="contact-details-header">

                <div>
                  <span className="contact-details-label">
                    CONVERSATION DETAILS
                  </span>

                  <h2>Message Information</h2>
                </div>

                <button
                  type="button"
                  className="contact-close-btn"
                  onClick={() => setSelectedMessage(null)}
                  aria-label="Close message details"
                >
                  <X size={19} />
                </button>

              </div>

              {/* SENDER PROFILE */}

              <div className="contact-sender-card">

                <div className="contact-sender-avatar">
                  {selectedMessage.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div className="contact-sender-details">

                  <h3>{selectedMessage.name}</h3>

                  <a href={`mailto:${selectedMessage.email}`}>
                    <Mail size={14} />
                    {selectedMessage.email}
                  </a>

                </div>

                <span className={statusClass(selectedMessage.status)}>
                  {selectedMessage.status}
                </span>

              </div>

              {/* MESSAGE META */}

              <div className="contact-meta-grid">

                <div className="contact-meta-item">
                  <Calendar size={17} />

                  <div>
                    <span>Received On</span>
                    <strong>
                      {formatDate(selectedMessage.createdAt)}
                    </strong>
                  </div>
                </div>

                <div className="contact-meta-item">
                  <MessageSquare size={17} />

                  <div>
                    <span>Message Type</span>
                    <strong>Visitor Inquiry</strong>
                  </div>
                </div>

              </div>

              {/* MESSAGE BODY */}

              <div className="contact-message-body">

                <div className="contact-body-heading">
                  <div>
                    <span>SUBJECT</span>
                    <h3>{selectedMessage.subject}</h3>
                  </div>
                </div>

                <div className="contact-body-content">
                  {selectedMessage.message}
                </div>

              </div>

              {/* STATUS CONTROL */}

              <div className="contact-status-control">

                <div>
                  <h3>Conversation Status</h3>
                  <p>Update the current message status.</p>
                </div>

                <select
                  value={selectedMessage.status}
                  disabled={updating}
                  onChange={(event) =>
                    handleStatusChange(
                      selectedMessage._id,
                      event.target.value
                    )
                  }
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

              </div>

              {/* PREVIOUS REPLIES */}

              {selectedMessage.replies?.length > 0 && (
                <div className="contact-replies">

                  <div className="contact-section-heading">
                    <div>
                      <h3>Previous Replies</h3>
                      <p>Conversation history</p>
                    </div>

                    <span>
                      {selectedMessage.replies.length}
                    </span>
                  </div>

                  {selectedMessage.replies.map((item, index) => (
                    <div
                      className="contact-reply-item"
                      key={index}
                    >
                      <div className="contact-reply-heading">
                        <div className="contact-reply-avatar">
                          <Reply size={15} />
                        </div>

                        <div>
                          <strong>FeedLink Admin</strong>
                          <small>{formatDate(item.sentAt)}</small>
                        </div>
                      </div>

                      <p>{item.message}</p>
                    </div>
                  ))}

                </div>
              )}

              {/* REPLY COMPOSER */}

              <form
                className="contact-reply-form"
                onSubmit={handleReply}
              >

                <div className="contact-reply-heading-main">
                  <div>
                    <h3>
                      <Reply size={19} />
                      Reply to Visitor
                    </h3>

                    <p>
                      Your response will be sent to the visitor's email.
                    </p>
                  </div>
                </div>

                <div className="contact-reply-recipient">
                  <Mail size={15} />
                  <span>To:</span>
                  <strong>{selectedMessage.email}</strong>
                </div>

                <textarea
                  rows="5"
                  maxLength="3000"
                  placeholder="Write your response here..."
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  required
                />

                <div className="contact-reply-footer">

                  <small>{reply.length}/3000 characters</small>

                  <button
                    type="submit"
                    disabled={sendingReply || !reply.trim()}
                  >
                    {sendingReply ? (
                      <>
                        <Loader2 className="spin" size={17} />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Reply
                      </>
                    )}
                  </button>

                </div>

              </form>

            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default ContactMessages;